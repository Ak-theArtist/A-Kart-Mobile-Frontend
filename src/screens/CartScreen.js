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

// Safe text component to prevent styling issues
const SafeText = ({ style, children }) => {
    const baseStyle = { fontSize: 16 };
    return <Text style={{ ...baseStyle, ...style }}>{children}</Text>;
};

const CartScreen = ({ navigation }) => {
    const { cartItems, getTotalCartAmount, isLoading, error, allProduct, refreshCart } = useContext(ShopContext);
    const { colors, isDarkMode } = useContext(ThemeContext);
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
                    await refreshCart();
                } catch (error) {
                    console.error('Error refreshing cart:', error);
                }
            };

            refreshCartData();
        }, [])
    );

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : COLORS.background }]}>
                <Header title="Shopping Cart" showBack={false} showCart={false} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary} />
                    <SafeText style={{
                        fontSize: 18,
                        marginTop: 20,
                        color: isDarkMode ? '#ffffff' : COLORS.secondary
                    }}>
                        Loading your cart...
                    </SafeText>
                    <SafeText style={{
                        fontSize: 14,
                        textAlign: 'center',
                        marginTop: 10,
                        color: isDarkMode ? '#bbbbbb' : COLORS.gray
                    }}>
                        This may take a moment if the server is starting up
                    </SafeText>
                </View>
            </SafeAreaView>
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
            <SafeText style={{
                fontSize: 22,
                marginBottom: 10,
                color: isDarkMode ? '#ffffff' : COLORS.secondary
            }}>
                Your cart is empty
            </SafeText>
            <SafeText style={{
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 30,
                color: isDarkMode ? '#bbbbbb' : COLORS.gray
            }}>
                Looks like you haven't added anything to your cart yet
            </SafeText>
            <TouchableOpacity
                style={[styles.shopNowButton, {
                    backgroundColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                }]}
                onPress={() => navigation.navigate('Shop')}
                activeOpacity={0.8}
            >
                <SafeText style={{
                    fontSize: 16,
                    color: '#ffffff'
                }}>
                    Shop Now
                </SafeText>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
        </View>
    );

    const renderCartItem = ({ item }) => (
        <CartItem item={item} />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : COLORS.background }]}>
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
                        backgroundColor: isDarkMode ? '#1e1e1e' : COLORS.white,
                        borderTopColor: isDarkMode ? '#333333' : COLORS.lightGray
                    }]}>
                        <View style={styles.summaryRow}>
                            <SafeText style={{
                                fontSize: 16,
                                color: isDarkMode ? '#ffffff' : COLORS.secondary
                            }}>
                                Subtotal:
                            </SafeText>
                            <SafeText style={{
                                fontSize: 16,
                                color: isDarkMode ? '#ffffff' : COLORS.secondary
                            }}>
                                ₹{totalAmount}
                            </SafeText>
                        </View>

                        <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333333' : COLORS.lightGray }]} />

                        <View style={styles.summaryRow}>
                            <SafeText style={{
                                fontSize: 18,
                                color: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                            }}>
                                Total:
                            </SafeText>
                            <SafeText style={{
                                fontSize: 18,
                                color: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                            }}>
                                ₹{finalAmount}
                            </SafeText>
                        </View>

                        <TouchableOpacity
                            style={[styles.checkoutButton, {
                                backgroundColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                            }]}
                            onPress={() => navigation.navigate('Checkout')}
                            activeOpacity={0.8}
                        >
                            <SafeText style={{
                                fontSize: 16,
                                color: '#ffffff'
                            }}>
                                Proceed to Checkout
                            </SafeText>
                            <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 5 }} />
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
    bottomSafeArea: {
        height: Platform.OS === 'ios' ? 20 : 0,
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
});

export default CartScreen; 