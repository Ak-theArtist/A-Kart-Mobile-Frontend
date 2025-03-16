import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';

// Default placeholder image URL
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150';

const ProductCard = ({ product, onPress }) => {
    const navigation = useNavigation();
    const { addToCart } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);

    const handleAddToCart = () => {
        addToCart(product._id || product.id);
        Alert.alert('Success', 'Product added to cart!');
    };

    // Safely get image URI
    const getImageSource = () => {
        if (!product || !product.image) {
            return { uri: PLACEHOLDER_IMAGE };
        }

        // Handle if image is an array
        if (Array.isArray(product.image)) {
            return {
                uri: product.image[0] && typeof product.image[0] === 'string'
                    ? product.image[0]
                    : PLACEHOLDER_IMAGE
            };
        }

        // Handle if image is a string
        if (typeof product.image === 'string') {
            return { uri: product.image };
        }

        // Default fallback
        return { uri: PLACEHOLDER_IMAGE };
    };

    // Calculate discount percentage if both prices are available
    const calculateDiscount = () => {
        if (product.old_price && product.new_price) {
            const discount = Math.round(((product.old_price - product.new_price) / product.old_price) * 100);
            return discount > 0 ? discount : 0;
        }
        return 0;
    };

    const discount = calculateDiscount();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.white }]}
            onPress={onPress || (() => navigation.navigate('Product', { product }))}
            activeOpacity={0.8}
        >
            <Image
                source={getImageSource()}
                style={styles.image}
                resizeMode="cover"
                contentPosition="top"
            />

            {discount > 0 && (
                <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.discountText, { color: colors.white }]}>
                        {discount}% OFF
                    </Text>
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={[styles.name, { color: colors.secondary }]} numberOfLines={2}>
                    {product.name}
                </Text>

                <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: colors.primary }]}>
                        ₹{product.new_price || product.price}
                    </Text>

                    {product.old_price && (
                        <Text style={[styles.oldPrice, { color: colors.gray }]}>
                            ₹{product.old_price}
                        </Text>
                    )}
                </View>

                <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                            key={star}
                            name={star <= (product.rating || 0) ? 'star' : 'star-outline'}
                            size={14}
                            color={star <= (product.rating || 0) ? '#FFD700' : colors.gray}
                            style={styles.starIcon}
                        />
                    ))}
                    <Text style={[styles.ratingText, { color: colors.gray }]}>
                        ({product.rating || 0})
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddToCart}
                >
                    <Ionicons name="cart-outline" size={16} color={colors.white} />
                    <Text style={[styles.addButtonText, { color: colors.white }]}>Add</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 170,
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 6,
    },
    image: {
        width: '100%',
        height: 160,
    },
    discountBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    infoContainer: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        height: 40,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 6,
    },
    oldPrice: {
        fontSize: 12,
        textDecorationLine: 'line-through',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    starIcon: {
        marginRight: 1,
    },
    ratingText: {
        fontSize: 12,
        marginLeft: 3,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 6,
    },
    addButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});

export default ProductCard; 