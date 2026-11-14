import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useShopStore = create(persist((set) => ({
  cart: [], wishlist: [],
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.id === product.id);
    return existing ? { cart: state.cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) } : { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
  updateQuantity: (id, quantity) => set((state) => ({ cart: state.cart.map((item) => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item) })),
  toggleWishlist: (product) => set((state) => ({ wishlist: state.wishlist.some((item) => item.id === product.id) ? state.wishlist.filter((item) => item.id !== product.id) : [...state.wishlist, product] })),
}), { name: "saari-shop" }));