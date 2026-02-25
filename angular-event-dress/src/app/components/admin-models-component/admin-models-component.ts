import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModelService } from '../../services/model-service';
import { DressService } from '../../services/dress-service';
import { CategoryService } from '../../services/category-service';
import { UserService } from '../../services/user-service';
import { ModelModel } from '../../models/model.model';
import { DressModel } from '../../models/dress.model';
import { CategoryModel } from '../../models/category.model';
import { ModelCardComponent } from '../model-card-component/model-card-component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-admin-models',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, DialogModule, InputNumberModule, ProgressSpinnerModule, ModelCardComponent, TableModule, MultiSelectModule],
  templateUrl: './admin-models-component.html',
  styleUrl: './admin-models-component.scss',
})
export class AdminModelsComponent implements OnInit {
  private modelService = inject(ModelService);
  private dressService = inject(DressService);
  private categoryService = inject(CategoryService);
  private userService = inject(UserService);
  private router = inject(Router);

  models = signal<ModelModel[]>([]);
  categories = signal<CategoryModel[]>([]);
  loading = signal(true);
  
  editDialog = signal(false);
  deleteDialog = signal(false);
  dressDialog = signal(false);
  editingModel: ModelModel | null = null;
  deletingModel: ModelModel | null = null;
  addingModel = false;
  
  dresses = signal<DressModel[]>([]);
  editingDress: DressModel | null = null;
  deletingDress: DressModel | null = null;
  addingDress = false;
 
    ngOnInit(): void {
    const user = this.userService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.userService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadModels();
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => {
        console.error('שגיאה בטעינת קטגוריות:', err);
      }
    });
  }

  loadModels(): void {
    this.loading.set(true);
    
    this.modelService.getModels(undefined, undefined, undefined, undefined, undefined, 1, 100).subscribe({
      next: (data) => {
        this.models.set(data.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  openEditDialog(model: ModelModel): void {
    this.addingModel = false;
    this.editingModel = { ...model };
    this.loadDresses(model.id);
    this.editDialog.set(true);
  }

  openAddModel(): void {
    this.addingModel = true;
    this.editingModel = {
      id: 0,
      name: '',
      description: '',
      imgUrl: '',
      basePrice: 0,
      color: '',
      isActive: true,
      categories: []
    };
    this.dresses.set([]);
    this.editDialog.set(true);
  }

  loadDresses(modelId: number): void {
    this.dressService.getDressesByModelId(modelId).subscribe({
      next: (dresses) => {
        this.dresses.set(dresses);
      },
      error: (err) => {
        console.error('שגיאה בטעינת שמלות:', err);
        this.dresses.set([]);
      }
    });
  }

  openAddDress(): void {
    this.addingDress = true;
    this.editingDress = {
      id: 0,
      modelName: this.editingModel!.name,
      size: '',
      price: 0,
      note: '',
      modelImgUrl: this.editingModel!.imgUrl
    };
  }

  openEditDress(dress: DressModel): void {
    this.addingDress = false;
    this.editingDress = { ...dress };
  }

  saveDress(): void {
    if (!this.editingDress) return;

    const dressData = {
      modelId: this.editingModel!.id,
      size: this.editingDress.size,
      price: this.editingDress.price,
      note: this.editingDress.note || ''
    };

    if (this.addingDress) {
      this.dressService.addDress(dressData).subscribe({
        next: () => {
          this.loadDresses(this.editingModel!.id);
          this.editingDress = null;
        },
        error: (err) => console.error('שגיאה בהוספת שמלה:', err)
      });
    } else {
      this.dressService.updateDress(this.editingDress.id, dressData).subscribe({
        next: () => {
          this.loadDresses(this.editingModel!.id);
          this.editingDress = null;
        },
        error: (err) => console.error('שגיאה בעדכון שמלה:', err)
      });
    }
  }

  confirmDeleteDress(dress: DressModel): void {
    if (confirm(`האם למחוק שמלה במידה ${dress.size}?`)) {
      this.dressService.deleteDress(dress.id).subscribe({
        next: () => this.loadDresses(this.editingModel!.id),
        error: (err) => console.error('שגיאה במחיקת שמלה:', err)
      });
    }
  }

  openDeleteDialog(model: ModelModel): void {
    this.deletingModel = model;
    this.deleteDialog.set(true);
  }

  saveModel(): void {
    if (!this.editingModel) return;
    
    // וידוא שיש קטגוריות
    if (!this.editingModel.categories || this.editingModel.categories.length === 0) {
      alert('חובה לבחור לפחות קטגוריה אחת');
      return;
    }

    const updateData = {
      name: this.editingModel.name,
      description: this.editingModel.description,
      imgUrl: this.editingModel.imgUrl,
      basePrice: this.editingModel.basePrice,
      color: this.editingModel.color,
      categoriesId: this.editingModel.categories.map(c => c.id)
    };
    
    if (this.addingModel) {
      this.modelService.addModel(updateData).subscribe({
        next: () => {
          this.editDialog.set(false);
          this.loadModels();
        },
        error: (err) => {
          console.error('שגיאה בהוספת מודל:', err);
          alert('שגיאה בהוספת מודל: ' + (err.error || err.message));
        }
      });
    } else {
      this.modelService.updateModel(this.editingModel.id, updateData).subscribe({
        next: () => {
          this.editDialog.set(false);
          this.loadModels();
        },
        error: (err) => {
          console.error('שגיאה בעדכון מודל:', err);
          alert('שגיאה בעדכון מודל: ' + (err.error || err.message));
        }
      });
    }
  }

  confirmDelete(): void {
    if (!this.deletingModel) return;
    
    this.modelService.deleteModel(this.deletingModel.id).subscribe({
      next: () => {
        this.deleteDialog.set(false);
        this.loadModels();
      },
      error: (err) => {
        console.error('שגיאה במחיקת מודל:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}