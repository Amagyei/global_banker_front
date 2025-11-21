/**
 * Centralized type definitions for the frontend application
 * All models and interfaces should be defined here for consistency and maintainability
 */

// ============================================================================
// Catalog Models
// ============================================================================

/**
 * Bank financial institution model
 */
export interface Bank {
  id: string;
  name: string;
  logo?: string;
  logo_url?: string;
  country?: string;
  is_active?: boolean;
}

/**
 * Bank account product model
 */
export interface BankAccount {
  id: string;
  balance: string;
  description: string;
  price: string;
  name?: string;
  sku?: string;
  bank?: string;
  bank_name?: string;
  image_url?: string;
  has_fullz?: boolean; // Indicates if this account has fullz data available
  is_active?: boolean;
}

/**
 * Country model
 */
export interface Country {
  code: string;
  name: string;
  currency_code: string;
  flag_url?: string;
  is_supported?: boolean;
}

/**
 * Fullz package model
 */
export interface FullzPackage {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: string;
  price_minor: number;
  bank?: string;
  bank_name?: string;
  is_active?: boolean;
}

// ============================================================================
// Cart Models
// ============================================================================

/**
 * Cart item model
 */
export interface CartItem {
  id: string;
  description: string;
  price: string; // Currency string like "$95.00"
  quantity: number;
}

// ============================================================================
// Order Models
// ============================================================================

/**
 * Order status type
 */
export type OrderStatus = "paid" | "delivered" | "pending" | "canceled" | "failed" | "processing";

/**
 * Order model
 */
export interface Order {
  id: string;
  order_number: string;
  date: string;
  created_at?: string;
  brand: string;
  items: string;
  items_detail?: OrderItem[];
  total: string;
  status: OrderStatus;
  recipient?: {
    name: string;
    email?: string;
    phone?: string;
    country_code?: string;
    delivery_channel?: string;
  };
}

/**
 * Order item detail model
 */
export interface OrderItem {
  id: string;
  account_id?: string;
  account_name?: string;
  account_bank_name?: string;
  quantity: number;
  unit_price?: string;
  total_price?: string;
}

// ============================================================================
// Transaction Models
// ============================================================================

/**
 * Transaction direction type
 */
export type TransactionDirection = "credit" | "debit";

/**
 * Transaction category type
 */
export type TransactionCategory = "topup" | "purchase" | "transfer" | "fee" | "refund" | "adjustment";

/**
 * Transaction status type
 */
export type TransactionStatus = "completed" | "pending" | "failed";

/**
 * Transaction model
 */
export interface Transaction {
  id: string;
  date: string;
  created_at?: string;
  brand: string | null;
  description: string;
  amount: string;
  amount_minor?: number;
  status: TransactionStatus;
  direction?: TransactionDirection;
  category?: TransactionCategory;
}

// ============================================================================
// Wallet & Crypto Models
// ============================================================================

/**
 * Crypto network model
 */
export interface CryptoNetwork {
  id: string;
  name: string;
  native_symbol: string;
  is_testnet: boolean;
  db_is_testnet?: boolean; // Actual database value (may differ from effective is_testnet)
}

/**
 * Wallet model
 */
export interface Wallet {
  id: string;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  currency_code: string;
  balance: string; // Formatted currency string
  balance_minor: number; // Balance in minor units (cents)
  pending_minor?: number; // Pending top-ups in minor units
  updated_at?: string;
}

// ============================================================================
// Payment Models
// ============================================================================

/**
 * Payment method type
 */
export type PaymentMethod = "wallet" | "crypto";

/**
 * Invoice model
 */
export interface Invoice {
  id: string;
  payment_url: string;
  track_id: string;
  amount: number;
  currency: string;
  status: string;
  expired_at?: number | string;
  created_at?: string;
}

// ============================================================================
// Webhook Models
// ============================================================================

/**
 * Webhook payment status breakdown
 */
export interface WebhookStatusBreakdown {
  pending: number;
  paid: number;
  failed: number;
  expired: number;
}

/**
 * Webhook recent payment model
 */
export interface WebhookPayment {
  track_id: string;
  address: string;
  amount: string;
  currency: string;
  pay_currency: string;
  pay_amount?: string;
  created_at: string;
  expired_at: string | null;
  paid_at?: string;
  is_expired: boolean;
  user: string;
}

/**
 * Webhook status model
 */
export interface WebhookStatus {
  webhook_endpoint: string;
  status: string;
  last_24_hours: {
    total_payments: number;
    status_breakdown: WebhookStatusBreakdown;
    expired_but_pending: number;
  };
  recent_pending: WebhookPayment[];
  recent_paid: WebhookPayment[];
}

// ============================================================================
// User & Profile Models
// ============================================================================

/**
 * User model
 */
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  country_code?: string;
  time_zone?: string;
  marketing_opt_in?: boolean;
}

/**
 * Profile model
 */
export interface Profile {
  user: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  country_code?: string;
  time_zone?: string;
  marketing_opt_in: boolean;
}

// ============================================================================
// API Response Models
// ============================================================================

/**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * API error response model
 */
export interface ApiError {
  detail?: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

