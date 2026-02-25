import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { UserRegisterModel } from '../../models/user-register.model';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-user-register-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputTextModule, ButtonModule, PasswordModule, CardModule],
  templateUrl: './user-register-component.html',
  styleUrl: './user-register-component.scss',
})
export class UserRegisterComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  user: UserRegisterModel = new UserRegisterModel();
  errorMessage = signal<string>('');
  loading = signal(false);

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.userService.register(this.user).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error || 'Registration failed');
      }
    });
  }
}