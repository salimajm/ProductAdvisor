import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EcommerceComponent } from './ecommerce.component';
import { DetailProduitComponent } from '../detail-produit/detail-produit.component';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  { path: '', component: EcommerceComponent },
  { path: 'detail-produit/:ref', component: DetailProduitComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcommerceRoutingModule { }
