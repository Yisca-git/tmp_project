import { Routes } from '@angular/router';
import { HomeComponent } from './components/home-component/home-component';
import { ModelPageComponent } from './components/model-page-component/model-page-component';
import { CheckoutPageComponent } from './components/checkout-page-component/checkout-page-component';
import { ListModelsComponent } from './components/list-models-component/list-models-component';
import { UserLoginComponent } from './components/user-login-component/user-login-component';
import { UserRegisterComponent } from './components/user-register-component/user-register-component';
import { UserProfileComponent } from './components/user-profile-component/user-profile-component';
import { UserUpdateComponent } from './components/user-update-component/user-update-component';
import { AdminComponent } from './components/admin-component/admin-component';
import { AdminUsersComponent } from './components/admin-users-component/admin-users-component';
import { PersonalOrdersComponent } from './components/personal-orders-component/personal-orders-component';
import { adminGuard } from './guards/admin.guard';
import { userGuard } from './guards/user.guard';
import { AdminModelsComponent } from './components/admin-models-component/admin-models-component';
import { AdminOrdersComponent } from './components/admin-orders-component/admin-orders-component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'catalog', redirectTo: '/collection', pathMatch: 'full' },
  { path: 'collection', component: ListModelsComponent },
  { path: 'model/:id', component: ModelPageComponent, canActivate: [userGuard] },
  { path: 'checkout', component: CheckoutPageComponent, canActivate: [userGuard] },  
  { path: 'register', component: UserRegisterComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'personal', component: UserProfileComponent, canActivate: [userGuard] },
  { path: 'update-profile', component: UserUpdateComponent, canActivate: [userGuard] },
  { path: 'orders/:id', component: PersonalOrdersComponent, canActivate: [userGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: 'admin/models', component: AdminModelsComponent, canActivate: [adminGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [adminGuard] }
];