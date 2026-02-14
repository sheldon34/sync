
declare global {
  interface Window {
    PayHero: any;
  }
}

export enum Grade {
  A = 'A',
  B = 'B',
  C = 'C',
}

export interface HarvestListing {
  id: string;
  farmerName: string;
  cropType: string;
  quantityKg: number;
  location: string; // County
  coordinates?: { lat: number; lng: number }; // Added specific coordinates
  grade: Grade;
  pricePerKg: number;
  imageUrl?: string;
  saturationLevel?: 'low' | 'medium' | 'high'; // Derived from supply data
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ESCROW_HELD = 'ESCROW_HELD', // Money with Pay Hero
  COMPLETED = 'COMPLETED', // Handshake done, funds released
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  listingId: string;
  buyerName: string;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  mpesaTransactionId?: string;
  qrCodeData?: string;
}

export interface PayHeroResponse {
  success: boolean;
  message: string;
  transactionId?: string;
}

export interface SplitResult {
  farmerAmount: number;
  driverAmount: number;
  platformAmount: number;
  total: number;
}

export type TradeStep = 'weighing' | 'payment_escrow' | 'logistics_handshake' | 'settlement' | 'complete';
