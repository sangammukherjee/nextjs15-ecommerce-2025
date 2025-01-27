import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  gender: string;
  sizes: string[];
  colors: string[];
  price: number;
  stock: number;
  rating?: number;
  soldCount: number;
  images: string[];
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  fetchAllProductsForAdmin: () => Promise<void>;
  createProduct: (productData: FormData) => Promise<Product>;
  updateProduct: (id: string, productData: FormData) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductById: (id: string) => Promise<Product | null>;
  fetchProductsForClient: (params: {
    page?: number;
    limit?: number;
    categories?: string[];
    sizes?: string[];
    colors?: string[];
    brands?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => Promise<void>;
  setCurrentPage: (page: number) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: true,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  fetchAllProductsForAdmin: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_ROUTES.PRODUCTS}/fetch-admin-products`,
        {
          withCredentials: true,
        }
      );

      set({ products: response.data, isLoading: false });
    } catch (e) {
      set({ error: "Failed to fetch product", isLoading: false });
    }
  },
  createProduct: async (productData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_ROUTES.PRODUCTS}/create-new-product`,
        productData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      set({ isLoading: false });
      return response.data;
    } catch (e) {
      set({ error: "Failed to create product", isLoading: false });
    }
  },
  updateProduct: async (id: string, productData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_ROUTES.PRODUCTS}/${id}`,
        productData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      set({ isLoading: false });
      return response.data;
    } catch (e) {
      set({ error: "Failed to create product", isLoading: false });
    }
  },
  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_ROUTES.PRODUCTS}/${id}`, {
        withCredentials: true,
      });
      set({ isLoading: false });
      return response.data.success;
    } catch (e) {
      set({ error: "Failed to create product", isLoading: false });
    }
  },
  getProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_ROUTES.PRODUCTS}/${id}`, {
        withCredentials: true,
      });
      set({ isLoading: false });
      return response.data;
    } catch (e) {
      set({ error: "Failed to create product", isLoading: false });
      return null;
    }
  },
  fetchProductsForClient: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = {
        ...params,
        categories: params.categories?.join(","),
        sizes: params.sizes?.join(","),
        colors: params.colors?.join(","),
        brands: params.brands?.join(","),
      };

      const response = await axios.get(
        `${API_ROUTES.PRODUCTS}/fetch-client-products`,
        {
          params: queryParams,
          withCredentials: true,
        }
      );

      set({
        products: response.data.products,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalProducts: response.data.totalProducts,
        isLoading: false,
      });
    } catch (e) {
      set({ error: "Failed to fetch products", isLoading: false });
    }
  },
  setCurrentPage: (page: number) => set({ currentPage: page }),
}));
