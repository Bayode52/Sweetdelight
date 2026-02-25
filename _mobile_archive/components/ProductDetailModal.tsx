import React from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Star, ShoppingBag, Leaf, Clock, Flame } from 'lucide-react-native';
import { Product, useCartStore } from '@/store/useCartStore';

interface ProductDetailModalProps {
    product: Product | null;
    visible: boolean;
    onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, visible, onClose }) => {
    const addItem = useCartStore((state) => state.addItem);

    if (!product) return null;

    const handleAddToCart = () => {
        addItem(product);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end">
                <BlurView intensity={80} tint="dark" className="absolute inset-0" />

                <View className="bg-stone-900 rounded-t-[48px] h-[85%] border-t border-white/10 px-6 pt-8">
                    <View className="flex-row justify-between items-center mb-6">
                        <Pressable
                            onPress={onClose}
                            className="bg-white/5 p-2 rounded-full"
                        >
                            <X color="#FFFDD0" size={24} />
                        </Pressable>
                        <View className="bg-bakery-gold/20 px-4 py-1 rounded-full border border-bakery-gold/30">
                            <Text className="text-bakery-gold font-bold">Pastry of the Day</Text>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Image Placeholder */}
                        <View className="bg-stone-800 h-64 rounded-[32px] mb-8 items-center justify-center border border-white/5 shadow-2xl">
                            <Text className="text-stone-600 font-bold tracking-widest">PRODUCT IMAGE</Text>
                        </View>

                        <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-stone-100 text-3xl font-bold mb-2">{product.name}</Text>
                                <View className="flex-row items-center gap-2">
                                    <Star size={16} fill="#D4AF37" color="#D4AF37" />
                                    <Text className="text-bakery-gold font-bold">{product.rating}</Text>
                                    <Text className="text-stone-500">(120+ Reviews)</Text>
                                </View>
                            </View>
                            <Text className="text-stone-100 text-3xl font-bold">{product.price}</Text>
                        </View>

                        <Text className="text-stone-400 leading-6 mb-8">
                            Experience the perfect balance of flaky perfection and rich, artisan filling.
                            Our master bakers spend 48 hours crafting each layer to ensure a texture that melts in your mouth
                            while maintaining that classic, golden crunch.
                        </Text>

                        {/* Tags */}
                        <View className="flex-row gap-4 mb-8">
                            <View className="flex-row items-center gap-2 bg-stone-800/50 px-4 py-3 rounded-2xl">
                                <Leaf size={18} color="#D4AF37" />
                                <Text className="text-stone-300 font-medium">Organic</Text>
                            </View>
                            <View className="flex-row items-center gap-2 bg-stone-800/50 px-4 py-3 rounded-2xl">
                                <Flame size={18} color="#D4AF37" />
                                <Text className="text-stone-300 font-medium">320 kcal</Text>
                            </View>
                            <View className="flex-row items-center gap-2 bg-stone-800/50 px-4 py-3 rounded-2xl">
                                <Clock size={18} color="#D4AF37" />
                                <Text className="text-stone-300 font-medium">Freshly Baked</Text>
                            </View>
                        </View>

                        {/* Description Details */}
                        <View className="bg-stone-800/30 p-6 rounded-[32px] border border-white/5 mb-24">
                            <Text className="text-stone-100 font-bold mb-4 uppercase tracking-tighter text-sm">Chef's Note</Text>
                            <Text className="text-stone-400 italic">
                                "We use only AOP butter from the Charentes-Poitou region to achieve that signature deep milk flavor."
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Fixed Footer */}
                    <View className="absolute bottom-10 left-6 right-6 flex-row gap-4">
                        <Pressable
                            onPress={handleAddToCart}
                            className="flex-1 bg-bakery-gold h-16 rounded-2xl flex-row items-center justify-center gap-3 shadow-lg shadow-bakery-gold/30"
                        >
                            <ShoppingBag color="#3D1E06" size={20} />
                            <Text className="text-bakery-chocolate text-lg font-bold">Add to Cart</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
