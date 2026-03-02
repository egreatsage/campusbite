import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [], // Array to hold the food items
      
      // 1. Add item to cart
      addToCart: (food) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item.id === food.id);

        if (existingItem) {
          // If it exists, just increase the quantity
          set({
            cart: currentCart.map((item) =>
              item.id === food.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          // If it's new, add it with a quantity of 1
          set({ cart: [...currentCart, { ...food, quantity: 1 }] });
        }
      },

      // 2. Remove item entirely
      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) });
      },

      // 3. Update quantity (plus or minus)
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id); // Auto-remove if quantity hits 0
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      // 4. Clear the whole cart (used after successful checkout)
      clearCart: () => set({ cart: [] }),

      // 5. Helper function to get total price
      getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      // 6. Helper function to get total item count
      getTotalItems: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'campusbite-cart', // The key used in localStorage
    }
  )
);