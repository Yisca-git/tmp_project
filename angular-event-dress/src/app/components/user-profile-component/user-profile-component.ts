import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UserModel } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DialogModule, InputTextModule, PasswordModule, FormsModule],
  templateUrl: './user-profile-component.html',
  styleUrl: './user-profile-component.scss',
})
export class UserProfileComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser = this.userService.currentUser;

  // פיצ'רים מהגרסה שלה
  showUpdateDialog = false;
  editUser: UserModel | null = null;
  errorMessage = '';
  showSuccessAlert = false;

  isAdmin = () => this.userService.isAdmin();

  ngOnInit(): void {
    if (!this.currentUser()) {
      this.router.navigate(['/login']);
    }
  }

  // ניווט לעדכון דרך דף נפרד (שמור מהגרסה שלך)
  navigateToUpdate(): void {
    // אם רוצים להמשיך לדיאלוג פנימי
    this.editUser = { ...this.currentUser()! };
    this.showUpdateDialog = true;
    this.errorMessage = '';
    this.showSuccessAlert = false;
  }

  closeDialog(): void {
    this.showUpdateDialog = false;
    this.editUser = null;
    this.errorMessage = '';
    this.showSuccessAlert = false;
  }

  updateProfile(): void {
    if (!this.editUser) return;

    if (!this.editUser.firstName || !this.editUser.lastName || !this.editUser.phone) {
      this.errorMessage = 'נא למלא את כל השדות החובה';
      return;
    }

    this.userService.updateUser(this.editUser.id, this.editUser).subscribe({
      next: () => {
        this.closeDialog();
        this.showSuccessAlert = true;
        setTimeout(() => {
          this.showSuccessAlert = false;
        }, 600);
      },
      error: (err) => {
        this.errorMessage = 'שגיאה בעדכון הפרטים';
        console.error(err);
      }
    });
  }

  navigateToOrders(): void {
    const userId = this.currentUser()?.id;
    if (userId) {
      this.router.navigate(['/orders', userId]).then(() => {
        window.scrollTo(0, 0);
      });
    }
  }

  navigateToCart(): void {
    this.router.navigate(['/checkout']).then(() => {
      window.scrollTo(0, 0);
    });
  }
}