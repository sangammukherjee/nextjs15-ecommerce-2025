import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";

export interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressStore {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  createAddress: (address: Omit<Address, "id">) => Promise<Address | null>;
  updateAddress: (
    id: string,
    address: Partial<Address>
  ) => Promise<Address | null>;
  deleteAddress: (id: string) => Promise<boolean>;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,
  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_ROUTES.ADDRESS}/get-address`, {
        withCredentials: true,
      });

      set({ addresses: response.data.address, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: "Failed to fetch address" });
    }
  },
  createAddress: async (address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_ROUTES.ADDRESS}/add-address`,
        address,
        {
          withCredentials: true,
        }
      );

      const newAddress = response.data.address;

      set((state) => ({
        addresses: [newAddress, ...state.addresses],
        isLoading: false,
      }));

      return newAddress;
    } catch (e) {
      set({ isLoading: false, error: "Failed to fetch address" });
    }
  },
  updateAddress: async (id, address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_ROUTES.ADDRESS}/update-address/${id}`,
        address,
        {
          withCredentials: true,
        }
      );

      const updatedAddress = response.data.address;

      set((state) => ({
        addresses: state.addresses.map((item) =>
          item.id === id ? updatedAddress : item
        ),
        isLoading: false,
      }));

      return updatedAddress;
    } catch (e) {
      set({ isLoading: false, error: "Failed to fetch address" });
    }
  },
  deleteAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_ROUTES.ADDRESS}/delete-address/${id}`, {
        withCredentials: true,
      });

      set((state) => ({
        addresses: state.addresses.filter((address) => address.id !== id),
        isLoading: false,
      }));

      return true;
    } catch (e) {
      set({ isLoading: false, error: "Failed to fetch address" });
      return false;
    }
  },
}));
