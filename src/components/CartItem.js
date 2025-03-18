import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    useWindowDimensions
} from 'react-native';
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

const CartItem = ({ item, onPress }) => {
    const { removeFromCart, allProduct } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
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

    // Calculate item total price
    const itemTotal = (product.new_price || product.price) * (item.quantity || 1);

    // Adjust image size based on screen width for better responsiveness
    const imageSize = width < 350 ? 80 : 90;

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: COLORS.white }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <Image
                source={getImageSource()}
                style={[styles.image, { width: imageSize, height: imageSize }]}
                resizeMode="cover"
            />

            <View style={styles.detailsContainer}>
                <View style={styles.topRow}>
                    <Text style={[styles.name, { color: COLORS.secondary }]} numberOfLines={2}>
                        {product.name}
                    </Text>

                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={handleRemoveItem}
                        disabled={isUpdating}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        {isUpdating ? (
                            <ActivityIndicator size="small" color={COLORS.error} />
                        ) : (
                            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                        )}
                    </TouchableOpacity>
                </View>

                {product.old_price && (
                    <Text style={[styles.oldPrice, { color: COLORS.gray, textDecorationColor: COLORS.gray }]}>
                        ₹{product.old_price}
                    </Text>
                )}

                <Text style={[styles.price, { color: COLORS.primary }]}>
                    ₹{product.new_price || product.price}
                </Text>

                <View style={styles.bottomRow}>
                    <View style={styles.quantityContainer}>
                        <Text style={[styles.quantityLabel, { color: COLORS.gray }]}>
                            Quantity:
                        </Text>
                        <Text style={[styles.quantityText, { color: COLORS.secondary }]}>
                            {item.quantity || 1}
                        </Text>
                    </View>

                    <Text style={[styles.totalPrice, { color: COLORS.primary }]}>
                        ₹{itemTotal.toFixed(2)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        marginBottom: 15,
        borderRadius: 12,
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
    image: {
        borderRadius: 8,
    },
    detailsContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginRight: 10,
    },
    oldPrice: {
        fontSize: 14,
        textDecorationLine: 'line-through',
        marginTop: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 2,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityLabel: {
        fontSize: 14,
        marginRight: 5,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '500',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    removeButton: {
        padding: 5,
    },
    loader: {
        marginVertical: 5,
    },
});

export default CartItem; 