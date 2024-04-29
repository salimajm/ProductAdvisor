import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EcommerceComponent } from './ecommerce/ecommerce.component';
import { LoginComponent } from './admin/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { RegistrationComponent } from './admin/auth/registration/registration.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'ProductAdvisor', component: EcommerceComponent,    canActivate: [AuthGuard] // Utilise le AuthGuard pour protéger cette route
},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },

  {
    path: 'administration',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],

  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
