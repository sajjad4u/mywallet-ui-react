// API Types and Interfaces
export interface Account {
  id: number;
  name: string;
  currency: string;
  openingBalance: number;
  balance?: number;
}

export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface Person {
  id: number;
  name: string;
}

export interface Transaction {
  id?: number;
  amount: number;
  description: string;
  date: string;
  account: Account;
  category: Category;
  person?: Person;
  remarks?: string;
}

export interface TransactionFilter {
  dateFromFilter?: string;
  dateToFilter?: string;
  accountFilter?: string;
  categoryFilter?: string;
  personFilter?: string;
  remarksFilter?: string;
}

export interface AccountWiseTotal {
  accountName: string;
  currency: string;
  openingBalance: number;
  totalCredit: number;
  totalDebit: number;
  balance: number;
}

export interface CategoryWiseTotal {
  categoryName: string;
  total: number;
  type: string;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}
