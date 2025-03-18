import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    StatusBar,
    Animated,
    PanResponder,
    Share
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Default placeholder image URL
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400';

const ProductScreen = ({ route, navigation }) => {
    const { product } = route.params;
    const { addToCart, allProduct } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Zoom and pan state
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const rotation = useRef(new Animated.Value(0)).current;

    // Get product images
    const productImages = Array.isArray(product.image) ? product.image : [product.image];

    useEffect(() => {
        // Set the first image as selected image when component mounts
        if (productImages.length > 0 && !selectedImage) {
            setSelectedImage(productImages[0]);
        }
    }, [product]);

    // Get random related products
    useEffect(() => {
        if (allProduct && allProduct.length > 0) {
            // Filter products from the same category but exclude the current product
            const sameCategory = allProduct.filter(
                p => p.category === product.category && p._id !== product._id
            );

            // If we have enough products in the same category
            if (sameCategory.length >= 4) {
                // Shuffle and take first 4
                const shuffled = [...sameCategory].sort(() => 0.5 - Math.random());
                setRelatedProducts(shuffled.slice(0, 4));
            } else {
                // If not enough products in the same category, get random products
                const otherProducts = allProduct.filter(p => p._id !== product._id);
                const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
                setRelatedProducts(shuffled.slice(0, 4));
            }
        }
    }, [allProduct, product]);

    // Pan responder for image manipulation
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                // Store the initial values
                translateX.setOffset(translateX._value);
                translateY.setOffset(translateY._value);
            },
            onPanResponderMove: (evt, gestureState) => {
                // Handle pinch to zoom
                if (evt.nativeEvent.changedTouches.length > 1) {
                    const touch1 = evt.nativeEvent.changedTouches[0];
                    const touch2 = evt.nativeEvent.changedTouches[1];

                    const distance = Math.sqrt(
                        Math.pow(touch2.pageX - touch1.pageX, 2) +
                        Math.pow(touch2.pageY - touch1.pageY, 2)
                    );

                    // Adjust scale based on pinch distance
                    const newScale = Math.max(1, Math.min(5, distance / 200));
                    scale.setValue(newScale);
                } else {
                    // Handle pan
                    translateX.setValue(gestureState.dx);
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: () => {
                // Save the values
                translateX.flattenOffset();
                translateY.flattenOffset();
            }
        })
    ).current;

    // Reset zoom and position
    const resetImageTransform = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            Animated.spring(rotation, { toValue: 0, useNativeDriver: true })
        ]).start();
    };

    // Rotate image
    const rotateImage = () => {
        Animated.timing(rotation, {
            toValue: rotation._value + 90,
            duration: 250,
            useNativeDriver: true
        }).start();
    };

    // Share image
    const shareImage = async () => {
        try {
            await Share.share({
                message: `Check out this product: ${product.name}`,
                url: selectedImage
            });
        } catch (error) {
            Alert.alert('Error', 'Could not share the image');
        }
    };

    // Safely get image URI
    const getImageSource = (imageUrl) => {
        if (!imageUrl) {
            return { uri: PLACEHOLDER_IMAGE };
        }

        if (typeof imageUrl === 'string') {
            return { uri: imageUrl };
        }

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

    const toggleDescription = () => {
        setIsExpanded(!isExpanded);
    };

    const renderRelatedProductItem = ({ item }) => (
        <View style={styles.relatedProductItem}>
            <ProductCard
                product={item}
                onPress={() => navigation.replace('Product', { product: item })}
            />
        </View>
    );

    const renderImageThumbnail = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.thumbnailContainer,
                selectedImage === item && styles.selectedThumbnail
            ]}
            onPress={() => setSelectedImage(item)}
        >
            <Image
                source={getImageSource(item)}
                style={styles.thumbnailImage}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Product Details" showBack={true} />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Main Product Image */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setImageModalVisible(true)}
                >
                    <Image
                        source={getImageSource(selectedImage || (productImages.length > 0 ? productImages[0] : null))}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>

                {/* Image Thumbnails */}
                {productImages.length > 1 && (
                    <FlatList
                        data={productImages}
                        renderItem={renderImageThumbnail}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.thumbnailList}
                    />
                )}

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
                                size={20}
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
                    <Text
                        style={[
                            styles.descriptionText,
                            { color: colors.gray },
                            !isExpanded && styles.collapsedText
                        ]}
                        numberOfLines={isExpanded ? undefined : 3}
                    >
                        {product.description || 'No description available'}
                    </Text>

                    <TouchableOpacity
                        style={styles.showMoreButton}
                        onPress={toggleDescription}
                    >
                        <Text style={[styles.showMoreText, { color: colors.primary }]}>
                            {isExpanded ? 'Show Less' : 'Show Full Description'}
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: colors.lightGray }]} />

                    {/* Related Products Section */}
                    <Text style={[styles.relatedProductsTitle, { color: colors.secondary }]}>
                        You May Also Like
                    </Text>

                    <FlatList
                        data={relatedProducts}
                        renderItem={renderRelatedProductItem}
                        keyExtractor={item => (item._id || item.id || Math.random().toString()).toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.relatedProductsList}
                        ListEmptyComponent={
                            <Text style={[styles.emptyText, { color: colors.gray }]}>
                                Loading related products...
                            </Text>
                        }
                    />
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { backgroundColor: colors.white }]}>
                <View style={styles.priceContainer}>
                    <Text style={[styles.priceLabel, { color: colors.gray }]}>Price:</Text>
                    <Text style={[styles.bottomPrice, { color: colors.primary }]}>
                        ₹{price}
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

            {/* Image Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={imageModalVisible}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <StatusBar backgroundColor="#000" barStyle="light-content" />
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setImageModalVisible(false)}
                        >
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalActionButton} onPress={resetImageTransform}>
                                <MaterialIcons name="refresh" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalActionButton} onPress={rotateImage}>
                                <MaterialIcons name="rotate-right" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalActionButton} onPress={shareImage}>
                                <Ionicons name="share-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.modalContent} {...panResponder.panHandlers}>
                        <Animated.Image
                            source={getImageSource(selectedImage)}
                            style={[
                                styles.modalImage,
                                {
                                    transform: [
                                        { scale },
                                        { translateX },
                                        { translateY },
                                        {
                                            rotate: rotation.interpolate({
                                                inputRange: [0, 360],
                                                outputRange: ['0deg', '360deg']
                                            })
                                        }
                                    ]
                                }
                            ]}
                            resizeMode="contain"
                        />
                    </View>
                    {productImages.length > 1 && (
                        <View style={styles.modalThumbnailContainer}>
                            <FlatList
                                data={productImages}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalThumbnail,
                                            selectedImage === item && styles.selectedModalThumbnail
                                        ]}
                                        onPress={() => setSelectedImage(item)}
                                    >
                                        <Image
                                            source={getImageSource(item)}
                                            style={styles.modalThumbnailImage}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => `modal-thumb-${index}`}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>
                    )}
                </SafeAreaView>
            </Modal>
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
        marginBottom: 10,
    },
    thumbnailList: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        marginBottom: 20,
    },
    thumbnailContainer: {
        width: 60,
        height: 60,
        borderRadius: 5,
        marginRight: 10,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedThumbnail: {
        borderColor: '#0940a3',
        borderWidth: 2,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -25,
        padding: 20,
        paddingBottom: 120,
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
        marginTop: 5,
    },
    starIcon: {
        marginRight: 3,
    },
    ratingText: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: '500',
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
    collapsedText: {
        maxHeight: 66, // Approximately 3 lines
    },
    showMoreButton: {
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    showMoreText: {
        fontSize: 14,
        fontWeight: '600',
    },
    relatedProductsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    relatedProductsList: {
        paddingBottom: 10,
    },
    relatedProductItem: {
        width: width * 0.4,
        marginRight: 10,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 20,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        marginRight: 5,
    },
    bottomPrice: {
        fontSize: 18,
        fontWeight: 'bold',
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
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    modalCloseButton: {
        padding: 5,
    },
    modalActions: {
        flexDirection: 'row',
    },
    modalActionButton: {
        marginLeft: 20,
        padding: 5,
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: width,
        height: height * 0.6,
    },
    modalThumbnailContainer: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 15,
    },
    modalThumbnail: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginHorizontal: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#444',
    },
    selectedModalThumbnail: {
        borderColor: '#fff',
        borderWidth: 2,
    },
    modalThumbnailImage: {
        width: '100%',
        height: '100%',
    },
});

export default ProductScreen; 