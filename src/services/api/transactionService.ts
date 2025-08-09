import apiClient from '../../config/api';
import type { Transaction, TransactionFilter, ActionResult, AccountWiseTotal, CategoryWiseTotal } from './types';

export class TransactionService {
  private static readonly BASE_PATH = '/transaction';

  static async getAll(filters: TransactionFilter = {}): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.dateFromFilter) params.append('dateFromFilter', filters.dateFromFilter);
      if (filters.dateToFilter) params.append('dateToFilter', filters.dateToFilter);
      if (filters.accountFilter) params.append('accountFilter', filters.accountFilter);
      if (filters.categoryFilter) params.append('categoryFilter', filters.categoryFilter);
      if (filters.personFilter) params.append('personFilter', filters.personFilter);
      if (filters.remarksFilter) params.append('remarksFilter', filters.remarksFilter);

      const response = await apiClient.get(`${this.BASE_PATH}/all?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<Transaction> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      throw error;
    }
  }

  static async create(transaction: Omit<Transaction, 'id'>): Promise<ActionResult> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/save`, transaction);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async update(transaction: Transaction): Promise<ActionResult> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/save`, transaction);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<ActionResult> {
    try {
      const response = await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting transaction ${id}:`, error);
      throw error;
    }
  }

  static async getAccountWiseTotal(): Promise<AccountWiseTotal[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/accountWiseTotal`);
      return response.data;
    } catch (error) {
      console.error('Error fetching account-wise totals:', error);
      throw error;
    }
  }

  static async getCategoryWiseTotal(): Promise<CategoryWiseTotal[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/categoryWiseTotal`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category-wise totals:', error);
      throw error;
    }
  }
}
