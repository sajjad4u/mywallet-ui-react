import apiClient from '../../config/api';
import type { Person, ActionResult } from './types';

export class PersonService {
  private static readonly BASE_PATH = '/person';

  static async getAll(): Promise<Person[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching persons:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<Person> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching person ${id}:`, error);
      throw error;
    }
  }

  static async create(person: Omit<Person, 'id'>): Promise<ActionResult> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/save`, person);
      return response.data;
    } catch (error) {
      console.error('Error creating person:', error);
      throw error;
    }
  }

  static async update(person: Person): Promise<ActionResult> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/save`, person);
      return response.data;
    } catch (error) {
      console.error('Error updating person:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<ActionResult> {
    try {
      const response = await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting person ${id}:`, error);
      throw error;
    }
  }
}
