import apiClient from '../../config/api';
import type { Category, ActionResult } from './types';

export class CategoryService {
  private static readonly BASE_PATH = '/category';

  static async getAll(): Promise<Category[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<Category> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  }

  static async create(category: Omit<Category, 'id'>): Promise<ActionResult> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/save`, category);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  static async update(category: Category): Promise<ActionResult> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/save`, category);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<ActionResult> {
    try {
      const response = await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
}
