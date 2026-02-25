import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, CreditCard, Apple, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCartStore } from '@/store/useCartStore';

export default function CartScreen() {
    const router = useRouter();
    const { items, totalAmount, removeItem, clearCart } = useCartStore();

    const handleRemove = (id: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        removeItem(id);
    };

    const handleCheckout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alert("Order placed successfully! Your artisan treats are on the way.");
        clearCart();
        router.replace('/');
    };

    return (
        <SafeAreaView className="flex-1 bg-stone-950">
            {/* Header */}
            <View className="flex-row items-center px-6 py-4">
                <Pressable
                    onPress={() => router.back()}
                    className="bg-stone-900 p-3 rounded-2xl active:scale-95"
                >
                    <ChevronLeft color="#D4AF37" size={24} />
                </Pressable>
                <Text className="flex-1 text-center text-stone-100 text-xl font-bold mr-12">Artisan Basket</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                {items.length > 0 ? (
                    <>
                        {items.map((item) => (
                            <View key={item.id} className="flex-row items-center bg-stone-900/40 p-4 rounded-[28px] border border-white/5 mb-4">
                                <View className="w-20 h-20 bg-stone-800 rounded-2xl items-center justify-center mr-4">
                                    <Text className="text-stone-600 text-[8px] font-bold">IMAGE</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-stone-100 font-bold text-lg mb-1">{item.name}</Text>
                                    <Text className="text-bakery-gold font-bold">{item.price} x {item.quantity}</Text>
                                </View>
                                <Pressable
                                    onPress={() => handleRemove(item.id)}
                                    className="bg-stone-900 p-3 rounded-2xl"
                                >
                                    <Trash2 color="#57534E" size={20} />
                                </Pressable>
                            </View>
                        ))}

                        {/* Total Summary */}
                        <View className="mt-8 bg-stone-900/60 p-6 rounded-[32px] border border-white/5 shadow-2xl">
                            <View className="flex-row justify-between mb-4">
                                <Text className="text-stone-400">Subtotal</Text>
                                <Text className="text-stone-100 font-bold">£{totalAmount.toFixed(2)}</Text>
                            </View>
                            <View className="flex-row justify-between mb-4">
                                <Text className="text-stone-400">Artisan Delivery</Text>
                                <Text className="text-stone-100 font-bold">£2.50</Text>
                            </View>
                            <View className="h-[1px] bg-white/5 my-4" />
                            <View className="flex-row justify-between">
                                <Text className="text-stone-100 text-lg font-bold">Total Price</Text>
                                <Text className="text-bakery-gold text-2xl font-bold">£{(totalAmount + 2.5).toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Payment Methods */}
                        <Text className="text-stone-100 text-lg font-bold mt-10 mb-6">Payment Method</Text>
                        <View className="flex-row gap-4 mb-32">
                            <Pressable className="flex-1 bg-stone-900 p-6 rounded-[28px] items-center border border-bakery-gold/40">
                                <CreditCard color="#D4AF37" size={28} />
                                <Text className="text-stone-100 font-bold mt-2">Card</Text>
                            </Pressable>
                            <Pressable className="flex-1 bg-stone-900 p-6 rounded-[28px] items-center border border-white/5">
                                <Apple color="#FFF" size={28} />
                                <Text className="text-stone-100 font-bold mt-2">Pay</Text>
                            </Pressable>
                        </View>
                    </>
                ) : (
                    <View className="flex-1 items-center justify-center py-20">
                        <Text className="text-stone-500 italic text-lg mb-8">Your basket is quite light...</Text>
                        <Pressable
                            onPress={() => router.back()}
                            className="bg-bakery-gold px-8 py-4 rounded-2xl"
                        >
                            <Text className="text-bakery-chocolate font-bold">Browse Menu</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            {/* Checkout Button */}
            {items.length > 0 && (
                <View className="absolute bottom-10 left-6 right-6">
                    <View className="flex-row items-center justify-center mb-6 gap-2">
                        <ShieldCheck color="#D4AF37" size={16} />
                        <Text className="text-stone-500 text-xs">Secure artisan payment gateway</Text>
                    </View>
                    <Pressable
                        onPress={handleCheckout}
                        className="bg-bakery-gold h-18 rounded-[24px] items-center justify-center shadow-2xl shadow-bakery-gold/20 active:scale-95"
                    >
                        <Text className="text-bakery-chocolate text-xl font-bold">Settle Ledger</Text>
                    </Pressable>
                </View>
            )}
        </SafeAreaView>
    );
}
