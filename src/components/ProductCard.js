import React, { useContext, useState } from 'react';
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
    const { colors, isDarkMode } = useContext(ThemeContext);
    const [showSecondImage, setShowSecondImage] = useState(false);

    const handleAddToCart = () => {
        addToCart(product._id || product.id);
        Alert.alert('Success', 'Product added to cart!');
    };

    // Get product images array
    const getProductImages = () => {
        if (!product || !product.image) {
            return [PLACEHOLDER_IMAGE];
        }

        if (Array.isArray(product.image)) {
            return product.image.filter(img => typeof img === 'string');
        }

        return [product.image];
    };

    const productImages = getProductImages();

    // Safely get image URI for display
    const getImageSource = (index = 0) => {
        if (productImages.length === 0) {
            return { uri: PLACEHOLDER_IMAGE };
        }

        // If requesting second image but it doesn't exist, return first image
        if (index > 0 && index >= productImages.length) {
            return { uri: productImages[0] };
        }

        return { uri: productImages[index] };
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

    // Use cardBackground in dark mode for better contrast
    const cardBgColor = isDarkMode ? colors.cardBackground : colors.white;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: cardBgColor,
                    shadowColor: isDarkMode ? '#000' : '#000',
                    shadowOpacity: isDarkMode ? 0.25 : 0.1,
                }
            ]}
            onPress={onPress || (() => navigation.navigate('Product', { product }))}
            onLongPress={() => setShowSecondImage(true)}
            onPressOut={() => setShowSecondImage(false)}
            delayLongPress={200}
            activeOpacity={0.8}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={getImageSource(showSecondImage && productImages.length > 1 ? 1 : 0)}
                    style={styles.image}
                    resizeMode="cover"
                    resizeMethod="resize"
                />
            </View>

            {discount > 0 && (
                <View style={[styles.discountBadge, { backgroundColor: isDarkMode ? colors.primaryAlt : colors.primary }]}>
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
                    <Text style={[styles.price, { color: isDarkMode ? colors.primaryAlt : colors.primary }]}>
                        ₹{product.new_price || product.price}
                    </Text>

                    {product.old_price && (
                        <Text style={[styles.oldPrice, { color: colors.gray }]}>
                            ₹{product.old_price}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: isDarkMode ? colors.primaryAlt : colors.primary }]}
                    onPress={handleAddToCart}
                >
                    <Ionicons name="cart-outline" size={16} color={isDarkMode ? '#121212' : colors.white} />
                    <Text style={[styles.addButtonText, { color: isDarkMode ? '#121212' : colors.white }]}>Add</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginHorizontal: 2,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 170,
        overflow: 'hidden',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
        padding: 10,
        width: '100%',
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        height: 36,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 6,
        marginTop: 2,
    },
    addButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});

export default ProductCard; 