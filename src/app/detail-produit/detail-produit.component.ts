import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Produit } from '../model/Produit';
import { ApiWebsiteService } from '../services/api-website.service';

@Component({
  selector: 'app-detail-produit',
  templateUrl: './detail-produit.component.html',
  styleUrls: ['./detail-produit.component.css']
})
export class DetailProduitComponent implements OnInit {
  product: Produit | undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ApiWebsiteService
  ) { }

  ngOnInit(): void {
    // Retrieve the product reference from the route parameter
    this.route.paramMap.subscribe(params => {
      const ref = params.get('ref');
      if (ref) {
        // Call your service method to fetch the product details by reference
        this.productService.getDocumentByRef(ref).subscribe(
          (product) => {
            this.product = product;
          },
          (error) => {
            console.error(error);
          }
        );
      }
    });
  }
}
