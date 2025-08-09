import apiClient from '../../config/api';
import type { Account, ActionResult } from './types';

export class AccountService {
  private static readonly BASE_PATH = '/account';

  static async getAll(): Promise<Account[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<Account> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error);
      throw error;
    }
  }

  static async create(account: Omit<Account, 'id'>): Promise<ActionResult> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/save`, account);
      return response.data;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  static async update(account: Account): Promise<ActionResult> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/save`, account);
      return response.data;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<ActionResult> {
    try {
      const response = await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting account ${id}:`, error);
      throw error;
    }
  }
}
