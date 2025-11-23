import axios from "axios";

// Simple token storage keys
const ACCESS_KEY = "auth.access";
const REFRESH_KEY = "auth.refresh";
const USER_KEY = "auth.user";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function setSession(tokens: { access: string; refresh: string }, user?: any) {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser<T = any>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

// Use relative URL when frontend and backend are on same server
// This eliminates CORS issues since they share the same origin
// ALWAYS use relative path - works with both Vite proxy (dev) and Nginx (production)
const getApiBaseURL = () => {
  // Always use relative path - Vite proxy handles it in dev, Nginx in production
  // This ensures requests never try to connect directly to 127.0.0.1:8000 from browser
  return "/api";
};

export const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 15000,
});

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log("API Base URL:", api.defaults.baseURL);
}

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    if (!config.headers) {
      config.headers = {} as typeof config.headers;
    }
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  // Log requests in development
  if (import.meta.env.DEV) {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config);
  }
  return config;
});

// Refresh token flow on 401
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

async function refreshToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => pendingQueue.push(resolve));
  }
  isRefreshing = true;
  try {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;
    // Use the api instance to ensure consistent base URL
    const { data } = await api.post("/auth/refresh/", { refresh });
    const newAccess = data.access as string;
    // Update refresh token if rotation returned a new one
    if (data.refresh) {
      localStorage.setItem(REFRESH_KEY, data.refresh);
    }
    localStorage.setItem(ACCESS_KEY, newAccess);
    pendingQueue.forEach((fn) => fn(newAccess));
    return newAccess;
  } catch (err) {
    console.error("Token refresh failed:", err);
    clearSession();
    pendingQueue.forEach((fn) => fn(null));
    return null;
  } finally {
    isRefreshing = false;
    pendingQueue = [];
  }
}

api.interceptors.response.use(
  (res) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${res.config.method?.toUpperCase()} ${res.config.url}`, res.status, res.data);
    }
    return res;
  },
  async (error) => {
    // Log errors
    console.error("[API Error]", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        original.headers = original.headers || {};
        original.headers["Authorization"] = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

// Accounts API
export async function login(email: string, password: string) {
  try {
    const { data } = await api.post("/auth/login/", { email, password });
    console.log("Login response:", data);
    if (!data.tokens || !data.tokens.access || !data.tokens.refresh) {
      throw new Error("Invalid response format: missing tokens");
    }
    setSession(data.tokens, data.user);
    return data;
  } catch (error: any) {
    console.error("Login error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    // Re-throw with more context
    if (error.response) {
      throw error;
    }
    throw new Error(error.message || "Login failed");
  }
}

export async function register(payload: {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}) {
  const { data } = await api.post("/auth/register/", payload);
  setSession(data.tokens, data.user);
  return data;
}

export async function getMyProfile() {
  const { data } = await api.get("/profile/me/");
  return data;
}

export async function updateMyProfile(patch: Partial<{
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string;
  country_code: string;
  time_zone: string;
  marketing_opt_in: boolean;
}>) {
  const { data } = await api.patch("/profile/me/", patch);
  return data;
}

// TODO(verif): Include Proof-of-Work puzzle solution with login/register once backend requires it.
// TODO(verif): Trigger small crypto deposit flow in UI as alternative verification when requested.

// Catalog API
export async function getCountries(params?: { is_supported?: boolean }) {
  const { data } = await api.get("/catalog/countries/", { params });
  return data;
}

export async function getBanks(params?: { country?: string; is_active?: boolean; has_fullz?: boolean }) {
  const { data } = await api.get("/catalog/banks/", { params });
  return data;
}

export async function getAccounts(params?: {
  country?: string;
  bank?: string;
  is_active?: boolean;
  ordering?: string;
}) {
  const { data } = await api.get("/catalog/accounts/", { params });
  return data;
}

export async function getFullzs(params?: {
  country?: string;
  bank?: string;
  is_active?: boolean;
  ordering?: string;
}) {
  const { data } = await api.get("/catalog/fullzs/", { params });
  return data;
}

export async function getFullzPackages(params?: {
  country?: string;
  bank?: string;
  is_active?: boolean;
  ordering?: string;
}) {
  const { data } = await api.get("/catalog/fullz-packages/", { params });
  return data;
}

// Transactions API
export async function getTransactions(params?: {
  direction?: 'credit' | 'debit';
  category?: 'topup' | 'purchase' | 'transfer' | 'fee' | 'refund' | 'adjustment';
  status?: 'pending' | 'completed' | 'failed';
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  ordering?: string;
}) {
  const { data } = await api.get("/transactions/", { params });
  return data;
}

// Orders API
export async function getCart() {
  const { data } = await api.get("/cart/");
  return data;
}

export async function addToCart(accountId: string, quantity: number = 1) {
  const { data } = await api.post("/cart/items/", { account_id: accountId, quantity });
  return data;
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await api.patch(`/cart/items/${itemId}/`, { quantity });
  return data;
}

export async function removeFromCart(itemId: string) {
  await api.delete(`/cart/items/${itemId}/`);
}

export async function getOrders() {
  const { data } = await api.get("/orders/");
  return data;
}

export async function createOrder(
  recipient: {
    name: string;
    email?: string;
    phone?: string;
    country_code?: string;
    delivery_channel?: string;
  },
  paymentMethod: 'wallet' | 'crypto' = 'wallet'
) {
  const { data } = await api.post("/orders/", { 
    recipient,
    payment_method: paymentMethod,
  });
  return data;
}

// Wallet API
export async function getWallet() {
  const { data } = await api.get("/wallet/wallet/");
  return data[0] || data; // Handle both array and single object responses
}

export async function getCryptoNetworks() {
  const { data } = await api.get("/wallet/networks/");
  return data;
}

export async function createTopUp(amountMinor: number, networkId: string, useStaticAddress: boolean = false) {
  const { data } = await api.post("/v2/wallet/topups/", {
    amount_minor: amountMinor,
    network_id: networkId,
    use_static_address: useStaticAddress,
  });
  return data;
}

export async function getTopUps() {
  const { data } = await api.get("/wallet/topups/");
  return data;
}

export async function checkTopUpStatus(topupId: string) {
  const { data } = await api.post(`/wallet/topups/${topupId}/check_status/`);
  return data;
}

export async function getOnChainTransactions() {
  const { data } = await api.get("/wallet/transactions/");
  return data;
}

// Payment API (v2)
export async function getPayments() {
  const { data } = await api.get("/v2/wallet/payments/");
  return data;
}

export async function createStaticAddress(networkId: string) {
  const { data } = await api.post("/v2/wallet/static-addresses/", {
    network_id: networkId,
  });
  return data;
}

export async function getStaticAddresses() {
  const { data } = await api.get("/v2/wallet/static-addresses/");
  return data;
}

export async function generateInvoice(params: {
  amount: number;
  currency?: string;
  lifetime?: number;
  callback_url?: string;
  return_url?: string;
  order_id?: string;
  email?: string;
  description?: string;
  thanks_message?: string;
  fee_paid_by_payer?: number;
  under_paid_coverage?: number;
  to_currency?: string;
  auto_withdrawal?: boolean;
  mixed_payment?: boolean;
  sandbox?: boolean;
}) {
  const { data } = await api.post("/v2/wallet/invoices/", params);
  return data;
}

export async function getAcceptedCurrencies() {
  const { data } = await api.get("/v2/wallet/payments/accepted_currencies/");
  return data;
}

// Webhook monitoring endpoints (admin only)
export async function getWebhookStatus() {
  const { data } = await api.get("/v2/wallet/webhook/status/");
  return data;
}

export async function getWebhookPaymentDetail(trackId: string) {
  const { data } = await api.get(`/v2/wallet/webhook/payment/${trackId}/`);
  return data;
}

export async function testWebhook(trackId: string, status: string = "paid", txHash?: string) {
  const { data } = await api.post("/v2/wallet/webhook/test/", {
    track_id: trackId,
    status,
    tx_hash: txHash,
  });
  return data;
}



