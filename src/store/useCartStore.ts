import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
    id: string;
    name: string;
    price: number;
    sale_price?: number | null;
    on_sale?: boolean;
    rating?: number;
    reviewCount?: number;
    category: string;
    description: string;
    image_url: string;
    images?: string[];
    is_available: boolean;
    is_featured: boolean;
}

export interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    totalAmount: number;
    itemCount: number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            totalAmount: 0,
            itemCount: 0,

            addItem: (product) =>
                set((state) => {
                    const existingItem = state.items.find((item) => item.id === product.id);
                    const newItems = existingItem
                        ? state.items.map((item) =>
                            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                        )
                        : [...state.items, { ...product, quantity: 1 }];

                    return {
                        items: newItems,
                        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
                        totalAmount: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
                    };
                }),

            removeItem: (productId) =>
                set((state) => {
                    const newItems = state.items.filter((item) => item.id !== productId);
                    return {
                        items: newItems,
                        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
                        totalAmount: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
                    };
                }),

            updateQuantity: (productId, delta) =>
                set((state) => {
                    const newItems = state.items.map((item) => {
                        if (item.id === productId) {
                            const newQty = Math.max(1, item.quantity + delta);
                            return { ...item, quantity: newQty };
                        }
                        return item;
                    });
                    return {
                        items: newItems,
                        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
                        totalAmount: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
                    };
                }),

            clearCart: () => set({ items: [], totalAmount: 0, itemCount: 0 }),
        }),
        {
            name: "bakery-cart",
        }
    )
);
