import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image
} from 'react-native';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import CartItem from '../components/CartItem';
import { SIZES } from '../constants/theme';

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
    const { cartItems, getTotalCartAmount, isLoading, error, allProduct } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    if (!allProduct || allProduct.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: COLORS.secondary }]}>
                    Loading products...
                </Text>
            </View>
        );
    }

    // Calculate total amount
    const totalAmount = getTotalCartAmount();

    // Remove tax calculation
    const finalAmount = totalAmount;

    return (
        <View style={[styles.container, { backgroundColor: COLORS.background }]}>
            <Header title="Shopping Cart" showBack={false} showCart={false} />

            {cartItems.length === 0 ? (
                <View style={styles.emptyCartContainer}>
                    <Image
                        source={require('../../public/assets/image2.png')}
                        style={styles.emptyCartGif}
                        resizeMode="contain"
                    />
                    <Text style={[styles.emptyCartText, { color: COLORS.secondary }]}>Your cart is empty</Text>
                    <TouchableOpacity
                        style={[styles.shopNowButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => navigation.navigate('Shop')}
                    >
                        <Text style={[styles.shopNowButtonText, { color: COLORS.white }]}>Shop Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        renderItem={({ item }) => <CartItem item={item} />}
                        keyExtractor={(item) => item.productId}
                        contentContainerStyle={styles.cartItemsList}
                    />

                    <View style={[styles.cartSummary, {
                        backgroundColor: COLORS.white,
                        borderTopColor: COLORS.lightGray
                    }]}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryText, { color: COLORS.secondary }]}>Subtotal:</Text>
                            <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>₹{totalAmount}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryText, { color: COLORS.primary, fontWeight: 'bold' }]}>Total:</Text>
                            <Text style={[styles.summaryValue, { color: COLORS.primary, fontWeight: 'bold' }]}>₹{finalAmount}</Text>
                        </View>

                        <View style={styles.checkoutContainer}>
                            <View style={styles.totalContainer}>
                                <Text style={[styles.totalText, { color: COLORS.secondary }]}>Total:</Text>
                                <Text style={[styles.totalAmount, { color: COLORS.primary }]}>₹{finalAmount}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.checkoutButton, { backgroundColor: COLORS.primary }]}
                                onPress={() => navigation.navigate('Checkout')}
                            >
                                <Text style={[styles.checkoutButtonText, { color: COLORS.white }]}>
                                    Checkout
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyCartGif: {
        width: 250,
        height: 250,
        marginBottom: 20,
    },
    emptyCartText: {
        fontSize: 18,
        marginBottom: 20,
    },
    shopNowButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    shopNowButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartItemsList: {
        padding: SIZES.padding,
    },
    cartSummary: {
        padding: 20,
        borderTopWidth: 1,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 16,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginVertical: 10,
    },
    checkoutContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalText: {
        fontSize: 16,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkoutButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
    },
});

export default CartScreen; 