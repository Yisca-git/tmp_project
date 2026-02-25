import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { UserModel } from '../../models/user.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    SelectModule
  ],
  templateUrl: './admin-users-component.html',
  styleUrl: './admin-users-component.scss',
})
export class AdminUsersComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  users = signal<UserModel[]>([]);
  allUsers: UserModel[] = [];
  loading = signal(true);
  searchQuery: string = '';
  searchError = signal<string>('');

  addDialog = signal(false);
  newUser: UserModel = this.createEmptyUser();
  roleOptions = [
    { label: 'משתמש', value: 'User' },
    { label: 'מנהל', value: 'Admin' }
  ];

  createEmptyUser(): UserModel {
    return {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'User'
    };
  }

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
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.loading.set(true);
    this.searchError.set('');
    this.searchQuery = '';

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.allUsers = [];
        this.users.set([]);
        this.loading.set(false);
      }
    });
  }

  searchUsers(): void {
    if (!this.searchQuery.trim()) {
      this.users.set(this.allUsers);
      this.searchError.set('');
      return;
    }

    const query = this.searchQuery.trim();
    const queryLower = query.toLowerCase();
    
    const filtered = this.allUsers.filter(user => {
      const id = user.id?.toString() || '';
      const firstName = user.firstName?.toLowerCase() || '';
      const lastName = user.lastName?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const phone = user.phone || '';
      const role = user.role?.toLowerCase() || '';
      
      return id.includes(query) ||
             firstName.includes(queryLower) ||
             lastName.includes(queryLower) ||
             email.includes(queryLower) ||
             phone.includes(query) ||
             role.includes(queryLower) ||
             `${firstName} ${lastName}`.includes(queryLower);
    });
    
    this.users.set(filtered);
    
    if (filtered.length === 0) {
      this.searchError.set('לא נמצאו משתמשים תואמים');
    } else {
      this.searchError.set('');
    }
  }

  openAddDialog(): void {
    this.newUser = this.createEmptyUser();
    this.addDialog.set(true);
  }

  saveUser(): void {
    if (!this.newUser.firstName || !this.newUser.lastName || !this.newUser.phone || !this.newUser.password) {
      alert('אנא מלא את כל השדות החובה');
      return;
    }

    if (this.newUser.password.length < 6) {
      alert('הסיסמה חייבת להיות באורך 6 תווים לפחות');
      return;
    }

    this.userService.registerByAdmin(this.newUser).subscribe({
      next: () => {
        this.addDialog.set(false);
        this.loadAllUsers();
        alert('משתמש נוסף בהצלחה');
      },
      error: (err) => {
        console.error('שגיאה בהוספת משתמש:', err);
        alert('שגיאה בהוספת משתמש');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}