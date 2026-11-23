export interface OwnerUser {
  _id: string;
  username: string;
  fullName: string;
  businessName: string;
  role: string;
  phone: string;
  email: string;
  warehouseAddress: string;
}

export interface ClientItem {
  _id: string;
  name: string;
  phone: string;
  address: string;
  totalAmount: number;
  unpaidAmount: number;
  totalTonnage: number;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

export type SettlementStatus = 'Paid' | 'Not Paid';

export interface TransactionItem {
  _id: string;
  clientId: string;
  clientName: string;
  quantity: number;
  unit: string;
  amount: number;
  paidAmount: number;
  status: SettlementStatus;
  date: string;
  settledAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenditureItem {
  _id: string;
  date: string;
  truckNumber: string;
  driverName: string;
  description: string;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarouselImageItem {
  _id: string;
  url: string;
  publicId?: string;
  caption: string;
  captionTe?: string;
  captionHi?: string;
  uploadedAt: string;
  createdAt: string;
}

export interface DashboardMetrics {
  todaysRevenue: number;
  thisMonthsRevenue: number;
  totalCredits: number;
  settledCredits: number;
  pendingReceivables: number;
  totalDebits: number;
  netOperatingPosition: number;
  totalClients: number;
  totalTonnage: number;
  carouselCount: number;
  recentPendingTransactions: TransactionItem[];
  recentExpenditures: ExpenditureItem[];
}

export type QuoteStatus = 'New' | 'Contacted' | 'Quoted' | 'Closed';

export interface InquiryItem {
  _id: string;
  name: string;
  phone: string;
  company: string;
  message: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}
