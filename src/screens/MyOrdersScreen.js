import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import { SIZES } from '../constants/theme';
import axios from 'axios';

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

const MyOrdersScreen = ({ navigation }) => {
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const { colors } = useContext(ThemeContext);
    const { allProduct } = useContext(ShopContext);

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        if (!user || !user._id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            console.log('Fetching orders for user:', user._id);

            const response = await axios.get(`https://a-kart-backend.onrender.com/order/ordersforuser`, {
                params: { userId: user._id },
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                withCredentials: true
            });

            console.log('Orders response:', response.data);

            // Check if response.data.orders exists and is an array
            if (response.data && response.data.orders) {
                // Sort orders by date (newest first)
                const sortedOrders = response.data.orders.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setOrders(sortedOrders);
                console.log('Sorted orders:', sortedOrders.length);
            } else {
                // If not an array, set orders to empty array
                console.log('Orders data is not properly formatted:', response.data);
                setOrders([]);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (!status) return COLORS.gray;

        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'delivered') return COLORS.success;
        if (normalizedStatus === 'shipped') return COLORS.primary;
        if (normalizedStatus === 'cancelled') return COLORS.error;
        return COLORS.warning; // pending or other statuses
    };

    const getStatusIcon = (status) => {
        if (!status) return 'help-circle-outline';

        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'delivered') return 'checkmark-circle';
        if (normalizedStatus === 'shipped') return 'airplane';
        if (normalizedStatus === 'cancelled') return 'close-circle';
        return 'time'; // pending or other statuses
    };

    const renderOrderItem = ({ item }) => {
        const orderDate = new Date(item.createdAt).toLocaleDateString();
        const orderTime = new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        console.log('Rendering order:', item._id);
        console.log('Order items:', item.items);

        // Helper function to get image source
        const getImageSource = (product) => {
            if (!product || !product.image) {
                return { uri: 'https://via.placeholder.com/150' }; // Default placeholder
            }

            // Handle if image is an array
            if (Array.isArray(product.image)) {
                return {
                    uri: product.image[0] && typeof product.image[0] === 'string'
                        ? product.image[0]
                        : 'https://via.placeholder.com/150'
                };
            }

            // Handle if image is a string
            if (typeof product.image === 'string') {
                return { uri: product.image };
            }

            // Default fallback
            return { uri: 'https://via.placeholder.com/150' };
        };

        return (
            <View style={[styles.orderCard, { backgroundColor: COLORS.white }]}>
                <View style={styles.orderHeader}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.orderId, { color: COLORS.secondary }]} numberOfLines={1} ellipsizeMode="middle">
                            Order ID: {item._id}
                        </Text>
                        <Text style={[styles.orderDate, { color: COLORS.gray }]}>
                            {orderDate} at {orderTime}
                        </Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) }
                    ]}>
                        <Ionicons
                            name={getStatusIcon(item.status)}
                            size={16}
                            color={COLORS.white}
                            style={styles.statusIcon}
                        />
                        <Text style={[styles.statusText, { color: COLORS.white }]}>
                            {item.status || 'Processing'}
                        </Text>
                    </View>
                </View>

                <View style={styles.orderItems}>
                    {item.items && item.items.map((orderItem, index) => {
                        // Check if orderItem has productId property directly or nested
                        const productId = orderItem.productId?._id || orderItem.productId;

                        // Find product details from allProduct
                        const product = allProduct.find(p =>
                            p._id === productId || p.id === productId
                        );

                        console.log(`Order item ${index}:`, orderItem);
                        console.log(`Product ID:`, productId);
                        console.log(`Found product:`, product ? product.name : 'Not found');

                        return (
                            <View key={index} style={styles.orderItemRow}>
                                {product && (
                                    <Image
                                        source={getImageSource(product)}
                                        style={styles.productImage}
                                        resizeMode="cover"
                                    />
                                )}
                                <View style={styles.productInfo}>
                                    <Text style={[styles.productName, { color: COLORS.secondary }]} numberOfLines={1} ellipsizeMode="tail">
                                        {product ? product.name :
                                            orderItem.productId?.name ||
                                            'Product'}
                                    </Text>
                                    <Text style={[styles.productQuantity, { color: COLORS.gray }]}>
                                        Qty: {orderItem.quantity}
                                    </Text>
                                </View>
                                {product && (
                                    <Text style={[styles.productPrice, { color: COLORS.primary }]}>
                                        ₹{(product.new_price || product.price) * orderItem.quantity}
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>

                <View style={[styles.divider, { backgroundColor: COLORS.lightGray }]} />

                <View style={styles.orderFooter}>
                    <Text style={[styles.totalItems, { color: COLORS.gray }]}>
                        Total Items: {item.items ? item.items.length : 0}
                    </Text>
                    <View style={styles.totalContainer}>
                        <Text style={[styles.totalLabel, { color: COLORS.secondary }]}>
                            Order Total:
                        </Text>
                        <Text style={[styles.totalAmount, { color: COLORS.primary }]}>
                            ₹{item.totalAmount}
                        </Text>
                    </View>
                </View>

                <View style={styles.addressContainer}>
                    <Text style={[styles.addressLabel, { color: COLORS.secondary }]}>
                        Delivery Address:
                    </Text>
                    <Text style={[styles.addressText, { color: COLORS.gray }]} numberOfLines={2}>
                        {item.address}
                    </Text>
                    <Text style={[styles.pincodeText, { color: COLORS.gray }]}>
                        Pincode: {item.pincode}
                    </Text>
                </View>
            </View>
        );
    };

    if (authLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.container, { backgroundColor: COLORS.background }]}>
                <Header title="My Orders" showBack={true} onBackPress={() => navigation.goBack()} />
                <View style={styles.emptyStateContainer}>
                    <Image
                        source={require('../../public/assets/login-first.gif')}
                        style={styles.emptyStateImage}
                    />
                    <Text style={[styles.emptyStateText, { color: COLORS.secondary }]}>
                        Please login to view your orders
                    </Text>
                    <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={[styles.loginButtonText, { color: COLORS.white }]}>
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: COLORS.background }]}>
            <Header title="My Orders" showBack={true} onBackPress={() => navigation.goBack()} />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={50} color={COLORS.error} />
                    <Text style={[styles.errorText, { color: COLORS.error }]}>{error}</Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: COLORS.primary }]}
                        onPress={fetchOrders}
                    >
                        <Text style={[styles.retryButtonText, { color: COLORS.white }]}>
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                    <Image
                        source={require('../../public/assets/emptycart.png')}
                        style={styles.emptyStateImage}
                    />
                    <Text style={[styles.emptyStateText, { color: COLORS.secondary }]}>
                        You haven't placed any orders yet
                    </Text>
                    <TouchableOpacity
                        style={[styles.shopButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => navigation.navigate('Shop')}
                    >
                        <Text style={[styles.shopButtonText, { color: COLORS.white }]}>
                            Start Shopping
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.ordersList}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={5}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                />
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    retryButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateImage: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    emptyStateText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    shopButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    shopButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    ordersList: {
        padding: 15,
        paddingBottom: 30,
    },
    orderCard: {
        borderRadius: 10,
        marginBottom: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    orderId: {
        fontSize: 14,
        fontWeight: 'bold',
        flexShrink: 1,
        width: '70%', // Limit width to prevent overflow
    },
    orderDate: {
        fontSize: 12,
        marginTop: 5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        minWidth: 80, // Ensure minimum width for status badge
        justifyContent: 'center',
    },
    statusIcon: {
        marginRight: 5,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    orderItems: {
        marginBottom: 15,
    },
    orderItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#f5f5f5',
    },
    productInfo: {
        flex: 1,
        marginRight: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        flexShrink: 1,
    },
    productQuantity: {
        fontSize: 12,
        marginTop: 3,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        minWidth: 70, // Ensure consistent width for price
        textAlign: 'right',
    },
    divider: {
        height: 1,
        marginVertical: 10,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalItems: {
        fontSize: 12,
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap', // Allow wrapping on smaller screens
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 5,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    addressContainer: {
        marginTop: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 5,
    },
    addressLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    addressText: {
        fontSize: 12,
        flexWrap: 'wrap', // Allow text to wrap
    },
    pincodeText: {
        fontSize: 12,
        marginTop: 5,
    },
});

export default MyOrdersScreen; 