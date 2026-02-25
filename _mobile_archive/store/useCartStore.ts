import { create } from 'zustand';

export interface Product {
    id: number;
    name: string;
    price: string;
    rating: string;
    category: string;
    description?: string;
    image?: string;
}

interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;
    totalAmount: number;
}

export const useCartStore = create<CartState>((set) => ({
    items: [],
    totalAmount: 0,
    addItem: (product: Product) =>
        set((state: CartState) => {
            const existingItem = state.items.find((item: CartItem) => item.id === product.id);
            const newItems = existingItem
                ? state.items.map((item: CartItem) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
                : [...state.items, { ...product, quantity: 1 }];

            const newTotal = newItems.reduce((sum: number, item: CartItem) => {
                const priceValue = parseFloat(item.price.replace('£', ''));
                return sum + priceValue * item.quantity;
            }, 0);

            return { items: newItems, totalAmount: newTotal };
        }),
    removeItem: (productId: number) =>
        set((state: CartState) => {
            const newItems = state.items.filter((item: CartItem) => item.id !== productId);
            const newTotal = newItems.reduce((sum: number, item: CartItem) => {
                const priceValue = parseFloat(item.price.replace('£', ''));
                return sum + priceValue * item.quantity;
            }, 0);
            return { items: newItems, totalAmount: newTotal };
        }),
    clearCart: () => set({ items: [], totalAmount: 0 }),
}));
