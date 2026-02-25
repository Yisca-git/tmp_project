import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

import { ModelModel } from '../../models/model.model';
import { ModelService } from '../../services/model-service';
import { DressService } from '../../services/dress-service';
import { DressModel } from '../../models/dress.model';
import { CartService } from '../../services/cart-service';
import { UserService } from '../../services/user-service';


@Component({
  selector: 'app-model-page-component',
  standalone: true,
  imports: [CommonModule, ButtonModule, SelectModule, DatePickerModule, FormsModule],
  templateUrl: './model-page-component.html',
  styleUrls: ['./model-page-component.scss'],
})
export class ModelPageComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modelService = inject(ModelService);
  private cdr = inject(ChangeDetectorRef);
  private dressService = inject(DressService);
  public cartService = inject(CartService);
  public userService = inject(UserService);
  invalidDate: boolean = false;
  conflictMessage: string = '';
  model?: ModelModel;
  sizes: string[] = [];
  selectedSize: string | null = null;
  selectedDate: Date | null = null;
  minDate: Date = new Date();
  isAvailable: boolean = false;
  availabilityChecked: boolean = false;
  dress?: DressModel;
  loadingAvailability: boolean = false; 
ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));

  this.modelService.getModelById(id).subscribe({
    next: (model: ModelModel) => {
      this.model = model;
      if (model.id) this.loadSizes(model.id);
      if (this.cartService.lastSelectedDate()) {
        this.selectedDate = this.cartService.lastSelectedDate();
      }
      this.cdr.detectChanges();
    }
  });
}
  loadSizes(modelId: number): void {
    this.dressService.GetSizesByModelId(modelId).subscribe({
      next: (sizes: string[]) => {
        this.sizes = sizes;
        this.cdr.detectChanges();
      }
    });
  }

  onSizeChange(): void {
    this.selectedDate = null;
    this.isAvailable = false;
    this.availabilityChecked = false;
    this.invalidDate = false;
    this.conflictMessage = '';
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    this.onSizeChange();
  }

  onDateSelect(): void {
    this.isAvailable = false;
    this.availabilityChecked = false;
    this.invalidDate = false;
    this.conflictMessage = '';
  }

checkAvailability(): void {
  if (!this.model?.id || !this.selectedSize || !this.selectedDate) {
    return; 
  }

  this.loadingAvailability = true;
  this.availabilityChecked = false;
  this.invalidDate = false;
  this.conflictMessage = '';

  // Check if dress already in cart within 7 days range FIRST
  this.dressService.getDressByModelIdAndSize(this.model.id, this.selectedSize).subscribe({
    next: (dress: DressModel) => {
      const selectedTime = this.selectedDate!.getTime();
      
      const conflictingDraft = this.cartService.draftOrders().find(draft => {
        const draftTime = new Date(draft.eventDate).getTime();
        const daysDiff = Math.abs(selectedTime - draftTime) / (24 * 60 * 60 * 1000);
        
        if (daysDiff <= 7) {
          return draft.items.some(item => item.id === dress.id);
        }
        return false;
      });

      if (conflictingDraft) {
        const conflictDate = new Date(conflictingDraft.eventDate).toLocaleDateString('he-IL');
        this.conflictMessage = `שמלה זו כבר בעגלה לתאריך ${conflictDate}. לא ניתן להזמין אותה שמלה בטווח של 7 ימים`;
        this.isAvailable = false;
        this.availabilityChecked = true;
        this.loadingAvailability = false;
        this.cdr.detectChanges();
        return;
      }

      // If no conflict, check server availability
      const dateOnly = this.selectedDate!.toLocaleDateString('en-CA'); 
      
      this.dressService
        .GetCountByModelIdAndSizeForDate(this.model!.id, this.selectedSize!, dateOnly)
        .subscribe({
          next: (count: number) => {
            this.availabilityChecked = true;
            this.isAvailable = count > 0;
            this.loadingAvailability = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('שגיאה בבדיקת זמינות:', err);
            if (err.message === 'INVALID_DATE') {
              this.invalidDate = true;
            }
            this.availabilityChecked = true;
            this.isAvailable = false;
            this.loadingAvailability = false;
            this.cdr.detectChanges();
          }
        });
    },
    error: (err) => {
      console.error('שגיאה בשליפת השמלה:', err);
      this.loadingAvailability = false;
      this.cdr.detectChanges();
    }
  });
}

addToCart(): void {

  if (!this.isAvailable || !this.model || !this.selectedSize || !this.selectedDate) return;

  this.dressService.getDressByModelIdAndSize(this.model.id, this.selectedSize).subscribe({
    next: (dress: DressModel) => {
      this.dress = dress;

      const existingDraft = this.cartService.draftOrders().find(d =>
        new Date(d.eventDate).toDateString() === this.selectedDate!.toDateString()
      );

      if (existingDraft) {
        this.cartService.addItemToDraft(existingDraft.id, dress);
      } else {
        const newDraft = this.cartService.createDraftOrder(this.selectedDate!);
        this.cartService.addItemToDraft(newDraft.id, dress);
      }

      this.cartService.lastSelectedDate.set(this.selectedDate);

      this.selectedSize = null;
      this.isAvailable = false;
      this.availabilityChecked = false;
      this.invalidDate = false;
      this.conflictMessage = '';
      this.cdr.detectChanges();

      console.log('השמלה נוספה לסל בהצלחה!');
    },
    error: (err) => {
      console.error('שגיאה בשליפת השמלה מהשרת:', err);
    }
  });
}

  goBack(): void {
    this.router.navigate(['/collection']);
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/600x800';
  }
}