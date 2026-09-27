// src/types/pizza.d.ts
/**
 * FORNO Pizza - TypeScript Definitions
 * Full static type definitions for pizza configuration, state, and pricing engine.
 */

export type PizzaSize = 'small' | 'med' | 'large';

export type DoughId = 'thin' | 'classic' | 'thick' | 'cheese';
export type SauceId = 'tomato' | 'spicy' | 'bbq' | 'garlic';
export type CheeseId = 'mozzarella' | 'extra' | 'four' | 'smoked';
export type MeatId = 'pepperoni' | 'beef' | 'chicken' | 'sausage';
export type VegId = 'olives' | 'mushroom' | 'onion' | 'greenPepper' | 'jalapeno' | 'basil';
export type ExtraId = 'extraCheese' | 'chili' | 'garlic' | 'truffle' | 'bbqDrizzle';

export type MeatPortion = 'less' | 'normal' | 'more';

export interface PizzaSnapshot {
  size: PizzaSize;
  dough: DoughId;
  sauce: SauceId | null;
  cheese: CheeseId | null;
  meats: Partial<Record<MeatId, MeatPortion>>;
  vegs: VegId[];
  extras: ExtraId[];
}

export interface IngredientPricing {
  small?: number;
  med?: number;
  large?: number;
  [key: string]: number | undefined;
}

export interface IngredientItem {
  id: string;
  name: string;
  desc?: string;
  price: number;
  prices?: IngredientPricing;
}

export interface MenuItem {
  id: string;
  cat: string[];
  name: string;
  price: number;
  img: string;
  ing: string[];
  simple?: boolean;
  preset?: PizzaSnapshot;
}

export interface CartItem {
  uid: number;
  kind: 'pizza' | 'simple';
  name: string;
  img: string;
  unit: number;
  qty: number;
  fromMenu?: boolean;
  meta?: string;
  snap?: PizzaSnapshot;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address?: string;
}

export type PaymentMethod = 'cash' | 'visa';
export type OrderType = 'delivery' | 'pickup';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'rejected';

export interface OrderRecord {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  order_type: OrderType;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}
