import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import { SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

// Default placeholder image URL
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400';

const ProductScreen = ({ route, navigation }) => {
    const { product } = route.params;
    const { addToCart } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);
    const [quantity, setQuantity] = useState(1);

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
    const price = product.new_price || product.price || 0;

    const handleAddToCart = () => {
        addToCart(product._id || product.id);
        Alert.alert('Success', 'Product added to cart!');
    };

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Product Details" showBack={true} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                    source={getImageSource()}
                    style={styles.productImage}
                    resizeMode="cover"
                />

                {discount > 0 && (
                    <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.discountText, { color: colors.white }]}>
                            {discount}% OFF
                        </Text>
                    </View>
                )}

                <View style={[styles.productInfo, { backgroundColor: colors.white }]}>
                    <Text style={[styles.productName, { color: colors.secondary }]}>
                        {product.name}
                    </Text>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.productPrice, { color: colors.primary }]}>
                            ₹{price}
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
                                size={18}
                                color={star <= (product.rating || 0) ? '#FFD700' : colors.gray}
                                style={styles.starIcon}
                            />
                        ))}
                        <Text style={[styles.ratingText, { color: colors.gray }]}>
                            ({product.rating || 0})
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.lightGray }]} />

                    <Text style={[styles.descriptionTitle, { color: colors.secondary }]}>
                        Description
                    </Text>
                    <Text style={[styles.descriptionText, { color: colors.gray }]}>
                        {product.description || 'No description available'}
                    </Text>

                    <View style={[styles.divider, { backgroundColor: colors.lightGray }]} />

                </View>
            </ScrollView>

            <View style={[styles.bottomBar, { backgroundColor: colors.white }]}>
                <View style={styles.priceContainer}>
                    <Text style={[styles.totalTitle, { color: colors.gray }]}>Total Price</Text>
                    <Text style={[styles.totalPrice, { color: colors.primary }]}>
                        ₹{(price * quantity).toFixed(2)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddToCart}
                >
                    <Ionicons name="cart-outline" size={20} color={colors.white} />
                    <Text style={[styles.addToCartText, { color: colors.white }]}>
                        Add to Cart
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    productImage: {
        width: width,
        height: width,
    },
    productInfo: {
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -25,
        padding: 20,
        paddingBottom: 100,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    starIcon: {
        marginRight: 2,
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginVertical: 15,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 22,
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    quantityTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 15,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    totalTitle: {
        fontSize: 12,
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    discountBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    discountText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    oldPrice: {
        fontSize: 16,
        textDecorationLine: 'line-through',
        marginLeft: 10,
    },
});

export default ProductScreen; 