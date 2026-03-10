export interface ShoppingListItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface EmailRequest {
  email: string;
  items: ShoppingListItem[];
  consent: boolean;
}