export interface Account {
  accountId: number;
  accountName: string;
  currency: string;
  openingBalance: number;
  remarks?: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  type: 'INCOME' | 'EXPENSE';
  remarks?: string;
}

export interface Person {
  personId: number;
  personName: string;
  contactNo?: string;
  email?: string;
  remarks?: string;
}

export interface Transaction {
  transactionId: number;
  date: string;
  categoryId: number;
  accountId: number;
  personId?: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  remarks?: string;
}

export interface Report {
  startDate: string;
  endDate: string;
  accountId?: number;
  categoryId?: number;
  personId?: number;
  type?: 'INCOME' | 'EXPENSE';
}
