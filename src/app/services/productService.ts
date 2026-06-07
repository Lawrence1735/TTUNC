import { api } from './api';

export interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  price: string;
  type: 'uniform' | 'instrument' | 'accessory';
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  status: 'available' | 'assigned' | 'borrowed' | 'returned' | 'lost' | 'damaged';
  talent_group: string | null;
  serial_number: string | null;
  property_type: string | null;
  instrument_type: string | null;
  accessory_type: string | null;
  uniform_set: string | null;
  assigned_to: number | null;
}

const productService = {
  getProducts: (params?: { talent_group?: string; type?: string }) =>
    api.get<ApiProduct[]>('products', { params }).then(r => r.data),

  createProduct: (data: Partial<ApiProduct>) =>
    api.post<ApiProduct>('products', data).then(r => r.data),

  updateProduct: (id: number, data: Partial<ApiProduct>) =>
    api.patch<ApiProduct>(`products/${id}`, data).then(r => r.data),

  deleteProduct: (id: number) =>
    api.delete(`products/${id}`),
};

export default productService;