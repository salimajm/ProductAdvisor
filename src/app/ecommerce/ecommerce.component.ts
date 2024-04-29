import { Component, OnInit } from '@angular/core';
import { ApiWebsiteService } from '../services/api-website.service';
import { Produit } from '../model/Produit';

@Component({
  selector: 'app-ecommerce',
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.css']
})
export class EcommerceComponent implements OnInit {
  produits: Produit[] = [];
  allProducts: Produit[] = []; // Copie non filtrée des produits
  categories1: string[] = [];
  categories: string[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  totalPages: number = 1;
  maxVisiblePages: number = 5;
  navbarOpen = false;
  selectedCategory: string = ''; 
  constructor(private service: ApiWebsiteService) {}

  ngOnInit(): void {
    this.getProducts();
    this.getCategories(); // Appel de la méthode pour charger les catégories

  }

  toggleDropdown(item: any): void {
    if (item.dropdown) {
      item.isOpen = !item.isOpen;
    }
  }
  getCategories(): void {
    this.service.getCategories().subscribe(data => {
      this.categories1 = data.categories1;
    });
  }
  searchProducts(): void {
    this.getProducts(this.searchTerm);
  }

  getProducts(searchTerm: string = ''): void {
    this.service.getDocuments(this.currentPage, searchTerm).subscribe(
      response => {
      
        this.produits = response.results;
        this.allProducts = response.results; // Mettez à jour la copie non filtrée des produits
        this.totalPages = Math.ceil(response.count / 20);
        this.hasPrevPage = this.currentPage > 1;
        this.hasNextPage = this.currentPage < this.totalPages;
        this.extractUniqueCategories(); // Appel de la fonction pour extraire les catégories uniques
      },
      error => {
        console.error(error);
      }
    );
  }
  extractUniqueCategories(): void {
    // Réinitialiser la liste des catégories à chaque appel
    this.categories = [];

    // Parcourir tous les produits pour extraire les catégories uniques
    this.produits.forEach(product => {
      if (product.Category && !this.categories.includes(product.Category)) {
        this.categories.push(product.Category);
      }
    });
  }

  // Ajoutez cette propriété à votre composant
  subCategories: string[] = [];

  // Ajoutez cette méthode à votre composant
  extractUniqueSubCategories(category: string): void {
    this.subCategories = [];
    this.produits.forEach(product => {
      if (product.Category === category && product.Subcategory && !this.subCategories.includes(product.Subcategory)) {
        this.subCategories.push(product.Subcategory);
      }
    });
  }
  
  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.getProducts(this.searchTerm);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage) {
      this.currentPage--;
      this.getProducts(this.searchTerm);
    }
  }


  filterProductsByCategory(category: string): Produit[] {
    if (!category) {
        return this.produits; // Si aucune catégorie n'est sélectionnée, retournez tous les produits
    } else {
        return this.produits.filter(product => product.Category === category);
    }
  }
  getPageNumbers(): number[] {
    const startPage = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + this.maxVisiblePages - 1);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPageLabel(): string {
    return `Page ${this.currentPage} / ${this.totalPages}`;
  }

  filterByCategory(Category: string): void {
    this.service.getDocuments(this.currentPage, '', Category).subscribe(
      response => {
        this.produits = response.results;
        this.totalPages = Math.ceil(response.count / 20);
        this.hasPrevPage = this.currentPage > 1;
        this.hasNextPage = this.currentPage < this.totalPages;
      },
      error => {
        console.error(error);
      }
    );
  }
  changePage(page: number) {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.getProducts(this.searchTerm); // Apply search term to new page
      // Navigate to URL with page number
      history.pushState(null, '', `liste_produits_page=${page}`);
    }
  }
}
