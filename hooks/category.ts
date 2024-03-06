// settingsStore.js
import axios from "@/lib/axios";
import { Category } from "@/type/api";
import { StoreApi, UseBoundStore, create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CategoriesState {
  categories: Category[];
  fetchCategories: () => Promise<void>;
}

const useCategoriestore: UseBoundStore<StoreApi<CategoriesState>> =
  create<CategoriesState>()(
    persist(
      (set) => ({
        categories: [],
        fetchCategories: async () => {
          try {
            const response = await axios.get("/categories", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            set({ categories: response.data.data });
          } catch (error) {
            console.error("Error fetching settings:", error);
          }
        },
      }),
      {
        name: "categories",
        storage: createJSONStorage(() => localStorage),
      }
    )
  );

// Create a singleton instance of the store
export { useCategoriestore };
