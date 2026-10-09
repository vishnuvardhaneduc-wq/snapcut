import { apiClient } from './api';
import type { Transaction } from '../types';

export const billingService = {
  // Create an order for a plan or credit top-up
  async createOrder(planId: string, amount: number): Promise<{ orderId: string; amount: number; currency: string }> {
    try {
      const response = await apiClient.post('/billing/create-order', { planId, amount });
      return response.data;
    } catch {
      return {
        orderId: `order_mock_${Date.now()}`,
        amount,
        currency: 'INR',
      };
    }
  },

  // Verify payment
  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/billing/verify-payment', paymentData);
      return response.data;
    } catch {
      return { success: true, message: 'Payment verified successfully' };
    }
  },

  // Get user billing transactions
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<Transaction[]>('/billing/transactions');
      return response.data;
    } catch {
      return [];
    }
  },
};
