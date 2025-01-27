import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  items: OrderItem[];
  couponId?: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  paymentMethod: "CREDIT_CARD";
  paymentStatus: "PENDING" | "COMPLETED";
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  userId: string;
  addressId: string;
  items: OrderItem[];
  couponId?: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  paymentMethod: "CREDIT_CARD";
  paymentStatus: "PENDING" | "COMPLETED";
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface CreateOrderData {
  userId: string;
  addressId: string;
  items: Omit<OrderItem, "id">[];
  couponId?: string;
  total: number;
  paymentMethod: "CREDIT_CARD";
  paymentStatus: "PENDING" | "COMPLETED";
  paymentId?: string;
}

interface OrderStore {
  currentOrder: Order | null;
  isLoading: boolean;
  isPaymentProcessing: boolean;
  userOrders: Order[];
  adminOrders: AdminOrder[];
  error: string | null;
  createPayPalOrder: (items: any[], total: number) => Promise<string | null>;
  capturePayPalOrder: (orderId: string) => Promise<any | null>;
  createFinalOrder: (orderData: CreateOrderData) => Promise<Order | null>;
  getOrder: (orderId: string) => Promise<Order | null>;
  updateOrderStatus: (
    orderId: string,
    status: Order["status"]
  ) => Promise<boolean>;
  getAllOrders: () => Promise<Order[] | null>;
  getOrdersByUserId: () => Promise<Order[] | null>;
  setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  currentOrder: null,
  isLoading: true,
  error: null,
  isPaymentProcessing: false,
  userOrders: [],
  adminOrders: [],
  createPayPalOrder: async (items, total) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_ROUTES.ORDER}/create-paypal-order`,
        { items, total },
        { withCredentials: true }
      );
      set({ isLoading: false });
      return response.data.id;
    } catch (error) {
      set({ error: "Failed to create paypal order", isLoading: false });
      return null;
    }
  },
  capturePayPalOrder: async (orderId) => {
    set({ isLoading: true, error: null, isPaymentProcessing: true });
    try {
      const response = await axios.post(
        `${API_ROUTES.ORDER}/capture-paypal-order`,
        { orderId },
        { withCredentials: true }
      );
      set({ isLoading: false, isPaymentProcessing: false });
      return response.data;
    } catch (error) {
      set({
        error: "Failed to capture paypal order",
        isLoading: false,
        isPaymentProcessing: false,
      });
      return null;
    }
  },
  createFinalOrder: async (orderData) => {
    set({ isLoading: true, error: null, isPaymentProcessing: true });
    try {
      const response = await axios.post(
        `${API_ROUTES.ORDER}/create-final-order`,
        orderData,
        { withCredentials: true }
      );
      set({
        isLoading: false,
        currentOrder: response.data,
        isPaymentProcessing: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: "Failed to capture paypal order",
        isLoading: false,
        isPaymentProcessing: false,
      });
      return null;
    }
  },
  updateOrderStatus: async (orderId, status) => {
    set({ isLoading: true, error: null });
    try {
      await axios.put(
        `${API_ROUTES.ORDER}/${orderId}/status`,
        { status },
        { withCredentials: true }
      );
      set((state) => ({
        currentOrder:
          state.currentOrder && state.currentOrder.id === orderId
            ? {
                ...state.currentOrder,
                status,
              }
            : state.currentOrder,
        isLoading: false,
        adminOrders: state.adminOrders.map((item) =>
          item.id === orderId
            ? {
                ...item,
                status,
              }
            : item
        ),
      }));
      return true;
    } catch (error) {
      set({ error: "Failed to capture paypal order", isLoading: false });
      return false;
    }
  },
  getAllOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_ROUTES.ORDER}/get-all-orders-for-admin`,
        { withCredentials: true }
      );
      set({ isLoading: false, adminOrders: response.data });
      return response.data;
    } catch (error) {
      set({ error: "Failed to fetch all orders for admin", isLoading: false });
      return null;
    }
  },
  getOrdersByUserId: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_ROUTES.ORDER}/get-order-by-user-id`,
        { withCredentials: true }
      );
      set({ isLoading: false, userOrders: response.data });
      return response.data;
    } catch (error) {
      set({ error: "Failed to fetch all orders for admin", isLoading: false });
      return null;
    }
  },
  setCurrentOrder: (order) => set({ currentOrder: order }),
  getOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_ROUTES.ORDER}/get-single-order/${orderId}`,
        { withCredentials: true }
      );
      set({ isLoading: false, currentOrder: response.data });
      return response.data;
    } catch (error) {
      set({ error: "Failed to fetch all orders for admin", isLoading: false });
      return null;
    }
  },
}));
