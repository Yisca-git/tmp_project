import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { OrderService } from '../../services/order-service';

@Component({
  selector: 'app-personal-orders-component',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ButtonModule, DialogModule], 
  templateUrl: './personal-orders-component.html',
  styleUrl: './personal-orders-component.scss',
})
export class PersonalOrdersComponent implements OnInit { 
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  orders = signal<any[]>([]);
  loading = signal<boolean>(true);
  selectedOrder = signal<any>(null);
  showDialog = signal<boolean>(false);

  ngOnInit() {
    const userIdRaw = this.route.snapshot.paramMap.get('id');
    if (userIdRaw) {
      const userId = Number(userIdRaw);

      this.orderService.getOrdersByUserId(userId).subscribe({
        next: (data) => {
          this.orders.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('שגיאה בטעינת הזמנות', err);
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  viewOrderDetails(order: any) {
    this.selectedOrder.set(order);
    this.showDialog.set(true);
  }

getSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
  switch (status) {
    case 'delivered': return 'success';
    case 'pending': return 'warn';   
    case 'cancelled': return 'danger';
    default: return 'info';
  }
}
}