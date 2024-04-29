export interface Produit {
  titre: string;
  image: string;
  prix: number;
  etat: number;
  ref: string;
  description:string;
  Category: string;
  Subcategory: string;
  isOpen?: boolean; // Ajoutez cette propriété
}


export interface PaginatedProduits {
  count: number;
  next: number | null;
  previous: number | null;
  results: Produit[];
}
