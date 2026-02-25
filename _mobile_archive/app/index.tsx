import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, Search, Menu, Star, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Product, useCartStore } from '@/store/useCartStore';
import { ProductDetailModal } from '@/components/ProductDetailModal';

const CATEGORIES = ["All", "Croissants", "Macarons", "Cakes", "Donuts"];

const PRODUCTS: Product[] = [
    { id: 1, name: "Pistachio Macaron", price: "£4.50", rating: "4.9", category: "Macarons" },
    { id: 2, name: "Almond Croissant", price: "£3.95", rating: "4.8", category: "Croissants" },
    { id: 3, name: "Velvet Cupcake", price: "£5.25", rating: "5.0", category: "Cakes" },
    { id: 4, name: "Glazed Donut", price: "£2.50", rating: "4.7", category: "Donuts" },
    { id: 5, name: "Chocolate Croissant", price: "£4.20", rating: "4.9", category: "Croissants" },
    { id: 6, name: "Lemon Tart", price: "£4.80", rating: "4.6", category: "Cakes" },
];

export default function Home() {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [isSearching, setIsSearching] = useState(false);

    const cartItems = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "All" || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const handleProductPress = (product: Product) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedProduct(product);
    };

    const handleAddToCart = (product: Product) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addItem(product);
    };

    const toggleSearch = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsSearching(!isSearching);
        if (isSearching) setSearchQuery("");
    };

    return (
        <SafeAreaView className="flex-1 bg-stone-950">
            <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-8">
                    {!isSearching ? (
                        <View>
                            <Text className="text-stone-400 text-lg font-light">Morning, Artisan</Text>
                            <Text className="text-bakery-gold text-3xl font-bold">Pastry Shop</Text>
                        </View>
                    ) : (
                        <View className="flex-1 mr-4 bg-stone-900 rounded-2xl flex-row items-center px-4 h-14 border border-white/5">
                            <Search color="#D4AF37" size={20} />
                            <TextInput
                                className="flex-1 ml-3 text-stone-100 font-medium"
                                placeholder="Search flavors..."
                                placeholderTextColor="#57534E"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            {searchQuery.length > 0 && (
                                <Pressable onPress={() => setSearchQuery("")}>
                                    <X color="#57534E" size={18} />
                                </Pressable>
                            )}
                        </View>
                    )}

                    <View className="flex-row gap-4">
                        <Pressable
                            onPress={toggleSearch}
                            className={`bg-stone-900 p-3 rounded-2xl active:scale-95 transition-all ${isSearching ? 'border border-bakery-gold/50' : ''}`}
                        >
                            {isSearching ? <X color="#D4AF37" size={24} /> : <Search color="#D4AF37" size={24} />}
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                router.push('/cart');
                            }}
                            className="bg-stone-900 p-3 rounded-2xl relative active:scale-95 transition-all"
                        >
                            <ShoppingCart color="#D4AF37" size={24} />
                            {cartCount > 0 && (
                                <View className="absolute top-2 right-2 bg-stone-100 w-4 h-4 rounded-full items-center justify-center">
                                    <Text className="text-stone-950 text-[10px] font-bold">{cartCount}</Text>
                                </View>
                            )}
                        </Pressable>
                    </View>
                </View>

                {/* Hero Section - Only show when not searching */}
                {!isSearching && (
                    <View className="bg-bakery-chocolate p-6 rounded-[32px] mb-8 overflow-hidden relative">
                        <View className="z-10">
                            <Text className="text-stone-400 text-sm font-medium uppercase tracking-widest mb-2">Today's Special</Text>
                            <Text className="text-stone-100 text-2xl font-bold mb-4">Golden Butter{"\n"}Croissant</Text>
                            <Pressable
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
                                className="bg-bakery-gold self-start px-6 py-3 rounded-xl shadow-lg shadow-bakery-gold/20 active:scale-95 transition-all"
                            >
                                <Text className="text-bakery-chocolate font-bold">Try Now</Text>
                            </Pressable>
                        </View>
                        <View className="absolute -right-4 -bottom-4 w-40 h-40 bg-bakery-gold/20 rounded-full blur-3xl opacity-50" />
                    </View>
                )}

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row mb-8 h-14"
                >
                    {CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setActiveCategory(cat);
                            }}
                            className={`px-6 py-3 rounded-2xl mr-4 active:scale-95 transition-all justify-center ${activeCategory === cat ? 'bg-bakery-gold' : 'bg-stone-900'}`}
                        >
                            <Text className={`font-medium ${activeCategory === cat ? 'text-bakery-chocolate' : 'text-stone-400'}`}>{cat}</Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Product Grid */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-stone-100 text-xl font-bold px-1">
                        {isSearching ? `Search Results (${filteredProducts.length})` : "Signature Sweets"}
                    </Text>
                </View>

                <View className="flex-row flex-wrap gap-4 pb-32">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((item) => (
                            <Pressable
                                key={item.id}
                                onPress={() => handleProductPress(item)}
                                className="bg-stone-900/50 p-4 rounded-[28px] w-[47%] border border-white/5 active:scale-[0.98] transition-all"
                            >
                                <View className="bg-stone-800 h-32 rounded-2xl mb-4 items-center justify-center">
                                    <Text className="text-stone-600 text-[10px] uppercase font-bold tracking-tighter">{item.category}</Text>
                                </View>
                                <Text className="text-stone-100 font-bold mb-1" numberOfLines={1}>{item.name}</Text>
                                <View className="flex-row items-center gap-1 mb-3">
                                    <Star size={12} fill="#D4AF37" color="#D4AF37" />
                                    <Text className="text-bakery-gold text-xs font-bold">{item.rating}</Text>
                                </View>
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-stone-100 text-lg font-bold">{item.price}</Text>
                                    <Pressable
                                        onPress={() => handleAddToCart(item)}
                                        className="bg-stone-800 p-2 rounded-xl active:scale-90 transition-all border border-white/5"
                                    >
                                        <Text className="text-bakery-gold text-xl font-bold">+</Text>
                                    </Pressable>
                                </View>
                            </Pressable>
                        ))
                    ) : (
                        <View className="w-full py-20 items-center justify-center">
                            <Text className="text-stone-500 italic text-center">No flavors found matching your search.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Navigation Dock */}
            <View className="absolute bottom-10 left-6 right-6 h-18 bg-stone-900/90 rounded-[28px] border border-white/10 flex-row justify-around items-center px-6 shadow-2xl">
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
                    <Menu color="#D4AF37" size={24} />
                </Pressable>
                <View className="w-14 h-1.5 bg-bakery-gold/20 rounded-full" />
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
                    <Text className="text-stone-100 font-bold text-lg">Menu</Text>
                </Pressable>
            </View>

            <ProductDetailModal
                product={selectedProduct}
                visible={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </SafeAreaView>
    );
}
