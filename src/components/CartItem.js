import React, { useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';

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

const CartItem = ({ item }) => {
    const { removeFromCart, updateCartItemCount, allProduct } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);
    const [isUpdating, setIsUpdating] = useState(false);

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    // Find the product details from allProduct
    const product = allProduct?.find(p => p._id === item.productId || p.id === item.productId);

    if (!product) {
        return null; // Product not found
    }

    // Handle image source - could be string or array
    const getImageSource = () => {
        if (!product.image) {
            return { uri: 'https://via.placeholder.com/150' }; // Default placeholder
        }

        if (typeof product.image === 'string') {
            return { uri: product.image };
        }

        if (Array.isArray(product.image) && product.image.length > 0) {
            return { uri: product.image[0] };
        }

        return { uri: 'https://via.placeholder.com/150' }; // Fallback placeholder
    };

    const handleRemoveItem = async () => {
        setIsUpdating(true);
        await removeFromCart(item.productId);
        setIsUpdating(false);
    };

    const handleUpdateQuantity = async (newQuantity) => {
        setIsUpdating(true);
        await updateCartItemCount(item.productId, newQuantity);
        setIsUpdating(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: COLORS.white }]}>
            <Image source={getImageSource()} style={styles.image} />

            <View style={styles.detailsContainer}>
                <Text style={[styles.name, { color: COLORS.secondary }]} numberOfLines={2}>
                    {product.name}
                </Text>
                <Text style={[styles.price, { color: COLORS.primary }]}>
                    ₹{product.new_price || product.price}
                </Text>

                {isUpdating ? (
                    <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
                ) : (
                    <View style={styles.quantityContainer}>
                        <Text style={[styles.quantity, { color: COLORS.secondary }]}>
                            Quantity: {item.quantity || 1}
                        </Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveItem}
                disabled={isUpdating}
            >
                {isUpdating ? (
                    <ActivityIndicator size="small" color={COLORS.error} />
                ) : (
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    detailsContainer: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderWidth: 1,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 16,
        fontWeight: '500',
    },
    removeButton: {
        padding: 5,
        justifyContent: 'center',
    },
    loader: {
        marginTop: 10,
        marginBottom: 10,
    },
});

export default CartItem; 