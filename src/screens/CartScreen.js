import React, { useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    Platform,
    useWindowDimensions,
    SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import CartItem from '../components/CartItem';
import { SIZES } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default colors in case ThemeContext is not available
const DEFAULT_COLORS = {
    primary: 'rgb(9, 64, 147)',
    secondary: '#333333',
    background: '#f8f8f8',
    white: '#ffffff',
    black: '#000000',
    gray: '#888888',
    lightGray: '#eeeeee',
    error: '#ff0000',
    success: '#4CAF50',
    warning: '#FFC107',
};

const CartScreen = ({ navigation }) => {
    const { cartItems, getTotalCartAmount, isLoading, error, allProduct, refreshCart } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    // Refresh cart data when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const refreshCartData = async () => {
                console.log('CartScreen focused - refreshing cart data');
                console.log('Current cartItems:', cartItems);
                try {
                    // Use the refreshCart function that handles all validation and fresh data fetching
                    await refreshCart();

                    // Log updated cart items
                    console.log('Cart data after refresh:', cartItems);

                    // Force reload by reading directly from AsyncStorage as a backup
                    const storedCartItems = await AsyncStorage.getItem('cartItems');
                    if (storedCartItems) {
                        console.log('Cart items from AsyncStorage:', storedCartItems.substring(0, 100));
                    }
                } catch (error) {
                    console.error('Error refreshing cart data:', error);
                }
            };

            refreshCartData();

            // Return cleanup function
            return () => {
                console.log('CartScreen unfocused');
            };
        }, [])
    );

    if (isLoading || !allProduct) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: COLORS.secondary }]}>
                    Loading products...
                </Text>
                <Text style={[styles.loadingSubtext, { color: COLORS.gray }]}>
                    This may take a moment if the server is starting up
                </Text>
            </View>
        );
    }

    // Calculate total amount
    const totalAmount = getTotalCartAmount();
    const finalAmount = totalAmount;

    const renderEmptyCart = () => (
        <View style={styles.emptyCartContainer}>
            <Image
                source={require('../../public/assets/image2.png')}
                style={styles.emptyCartImage}
                resizeMode="contain"
            />
            <Text style={[styles.emptyCartText, { color: COLORS.secondary }]}>
                Your cart is empty
            </Text>
            <Text style={[styles.emptyCartSubtext, { color: COLORS.gray }]}>
                Looks like you haven't added anything to your cart yet
            </Text>
            <TouchableOpacity
                style={[styles.shopNowButton, { backgroundColor: COLORS.primary }]}
                onPress={() => navigation.navigate('Shop')}
                activeOpacity={0.8}
            >
                <Text style={[styles.shopNowButtonText, { color: COLORS.white }]}>
                    Shop Now
                </Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 5 }} />
            </TouchableOpacity>
        </View>
    );

    const renderCartItem = ({ item }) => (
        <CartItem item={item} />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
            <Header title="Shopping Cart" showBack={false} showCart={false} />

            {cartItems.length === 0 ? (
                renderEmptyCart()
            ) : (
                <View style={styles.contentContainer}>
                    <FlatList
                        data={cartItems}
                        renderItem={renderCartItem}
                        keyExtractor={(item) => item.productId || item.id || Math.random().toString()}
                        contentContainerStyle={styles.cartItemsList}
                        showsVerticalScrollIndicator={true}
                        removeClippedSubviews={false}
                        initialNumToRender={4}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        ListFooterComponent={<View style={{ height: 220 }} />}
                        scrollEventThrottle={16}
                    />

                    <View style={[styles.cartSummary, {
                        backgroundColor: COLORS.white,
                        borderTopColor: COLORS.lightGray
                    }]}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryText, { color: COLORS.secondary }]}>
                                Subtotal:
                            </Text>
                            <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>
                                ₹{totalAmount}
                            </Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: COLORS.lightGray }]} />

                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryText, { color: COLORS.primary, fontWeight: 'bold' }]}>
                                Total:
                            </Text>
                            <Text style={[styles.summaryValue, { color: COLORS.primary, fontWeight: 'bold' }]}>
                                ₹{finalAmount}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.checkoutButton, { backgroundColor: COLORS.primary }]}
                            onPress={() => navigation.navigate('Checkout')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.checkoutButtonText, { color: COLORS.white }]}>
                                Proceed to Checkout
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 5 }} />
                        </TouchableOpacity>

                        <View style={styles.bottomSafeArea} />
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    loadingSubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyCartImage: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    emptyCartText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptyCartSubtext: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    shopNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    shopNowButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartItemsList: {
        padding: 15,
        paddingBottom: 220,
    },
    cartSummary: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 10 : 20,
        borderTopWidth: 1,
        zIndex: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 16,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 10,
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 5,
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomSafeArea: {
        height: Platform.OS === 'ios' ? 20 : 0,
    },
});

export default CartScreen; 