import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { WebsiteComponent } from './website/website.component';
import { SelectorsComponent } from './selectors/selectors.component';
import { EcommerceComponent } from '../ecommerce/ecommerce.component';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'admin/website', component: WebsiteComponent, canActivate: [AuthGuard]},
      { path: 'dashboard', component: SelectorsComponent, canActivate: [AuthGuard] },
      { path: 'ProductAdvisor', component: EcommerceComponent , canActivate: [AuthGuard]}, // Define the route for 'ecommerce'

      // Other child routes
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
