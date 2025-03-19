import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    SafeAreaView
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

// Safe text component to prevent styling issues
const SafeText = ({ style, children }) => {
    const baseStyle = { fontSize: 16 };
    return <Text style={{ ...baseStyle, ...style }}>{children}</Text>;
};

const CheckoutScreen = ({ navigation }) => {
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const { cartItems, getTotalCartAmount, clearCart, allProduct } = useContext(ShopContext);
    const { colors, isDarkMode } = useContext(ThemeContext);

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    // Calculate total amount
    const totalAmount = getTotalCartAmount();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isLoading, setIsLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        // Fetch user's addresses when component mounts
        if (user && user._id) {
            fetchAddresses();
        }
    }, [user]);

    // Redirect to login if not authenticated
    if (!user && !authLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : COLORS.background }]}>
                <Header title="Checkout" showBack={true} />
                <View style={styles.emptyStateContainer}>
                    <Image
                        source={require('../../public/assets/login-first.gif')}
                        style={styles.emptyStateImage}
                    />
                    <SafeText style={{
                        fontSize: 18,
                        textAlign: 'center',
                        marginBottom: 20,
                        color: isDarkMode ? '#ffffff' : COLORS.secondary
                    }}>
                        Please login to continue with checkout
                    </SafeText>
                    <TouchableOpacity
                        style={[styles.loginButton, {
                            backgroundColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                        }]}
                        onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                    >
                        <SafeText style={{
                            fontSize: 16,
                            color: '#ffffff'
                        }}>
                            Login
                        </SafeText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Redirect back to cart if cart is empty
    if (cartItems.length === 0 && !orderPlaced) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : COLORS.background }]}>
                <Header title="Checkout" showBack={true} />
                <View style={styles.emptyStateContainer}>
                    <Image
                        source={require('../../public/assets/image2.png')}
                        style={styles.emptyStateImage}
                    />
                    <SafeText style={{
                        fontSize: 18,
                        textAlign: 'center',
                        marginBottom: 20,
                        color: isDarkMode ? '#ffffff' : COLORS.secondary
                    }}>
                        Your cart is empty. Add some products to checkout.
                    </SafeText>
                    <TouchableOpacity
                        style={[styles.shopButton, {
                            backgroundColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                        }]}
                        onPress={() => navigation.navigate('Shop')}
                    >
                        <SafeText style={{
                            fontSize: 16,
                            color: '#ffffff'
                        }}>
                            Shop Now
                        </SafeText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const fetchAddresses = async () => {
        try {
            const response = await axios.get(`https://a-kart-backend.onrender.com/user/address/${user._id}`);
            if (response.data && response.data.addresses) {
                setAddresses(response.data.addresses);
                // Select the first address by default if available
                if (response.data.addresses.length > 0) {
                    setSelectedAddress(response.data.addresses[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            Alert.alert('Error', 'Failed to load your addresses. Please try again.');
        }
    };

    const getAddressById = (addressId) => {
        return addresses.find(addr => addr._id === addressId);
    };

    const getSelectedAddressDetails = () => {
        if (!selectedAddress) return null;
        return getAddressById(selectedAddress);
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        setIsLoading(true);

        try {
            const orderItems = cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.new_price
            }));

            const orderData = {
                userId: user._id,
                products: orderItems,
                addressId: selectedAddress,
                paymentMethod: paymentMethod,
                totalAmount: totalAmount
            };

            const response = await axios.post('https://a-kart-backend.onrender.com/order/create', orderData);

            if (response.data && response.data._id) {
                setOrderId(response.data._id);
                setOrderPlaced(true);
                await clearCart();
            }
        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Error', 'Failed to place your order. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderOrderSuccess = () => (
        <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={80} color={isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary} />
            <SafeText style={{
                fontSize: 24,
                marginTop: 20,
                marginBottom: 10,
                color: isDarkMode ? '#ffffff' : COLORS.secondary
            }}>
                Order Placed!
            </SafeText>
            <SafeText style={{
                fontSize: 16,
                textAlign: 'center',
                color: isDarkMode ? '#bbbbbb' : COLORS.gray
            }}>
                Your order has been successfully placed.
            </SafeText>
            <SafeText style={{
                fontSize: 14,
                marginTop: 10,
                color: isDarkMode ? '#bbbbbb' : COLORS.gray
            }}>
                Order ID: {orderId}
            </SafeText>
            <TouchableOpacity
                style={[styles.continueButton, {
                    backgroundColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                }]}
                onPress={() => navigation.navigate('Home')}
            >
                <SafeText style={{
                    fontSize: 16,
                    color: '#ffffff'
                }}>
                    Continue Shopping
                </SafeText>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.viewOrderButton, {
                    borderColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary,
                }]}
                onPress={() => navigation.navigate('Profile', { screen: 'MyOrders' })}
            >
                <SafeText style={{
                    fontSize: 16,
                    color: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                }}>
                    View My Orders
                </SafeText>
            </TouchableOpacity>
        </View>
    );

    const renderPaymentMethodSelector = () => (
        <View style={[styles.section, { backgroundColor: isDarkMode ? '#1e1e1e' : COLORS.white }]}>
            <SafeText style={{
                fontSize: 18,
                marginBottom: 15,
                color: isDarkMode ? '#ffffff' : COLORS.secondary
            }}>
                Payment Method
            </SafeText>

            <TouchableOpacity
                style={[
                    styles.paymentOption,
                    paymentMethod === 'COD' && {
                        borderColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary,
                        backgroundColor: isDarkMode ? 'rgba(42, 116, 226, 0.1)' : 'rgba(9, 64, 147, 0.05)'
                    }
                ]}
                onPress={() => setPaymentMethod('COD')}
            >
                <Ionicons
                    name="cash-outline"
                    size={24}
                    color={paymentMethod === 'COD'
                        ? (isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary)
                        : (isDarkMode ? '#bbbbbb' : COLORS.gray)
                    }
                />
                <View style={styles.paymentDetails}>
                    <SafeText style={{
                        fontSize: 16,
                        color: isDarkMode ? '#ffffff' : COLORS.secondary
                    }}>
                        Cash on Delivery
                    </SafeText>
                    <SafeText style={{
                        fontSize: 13,
                        color: isDarkMode ? '#bbbbbb' : COLORS.gray
                    }}>
                        Pay when you receive your order
                    </SafeText>
                </View>
                {paymentMethod === 'COD' && (
                    <Ionicons name="checkmark-circle" size={24} color={isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary} />
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.paymentOption,
                    { opacity: 0.6 }
                ]}
                onPress={() => Alert.alert('Coming Soon', 'Online payment options will be available soon!')}
            >
                <Ionicons name="card-outline" size={24} color={isDarkMode ? '#bbbbbb' : COLORS.gray} />
                <View style={styles.paymentDetails}>
                    <SafeText style={{
                        fontSize: 16,
                        color: isDarkMode ? '#ffffff' : COLORS.secondary
                    }}>
                        Credit/Debit Card
                    </SafeText>
                    <SafeText style={{
                        fontSize: 13,
                        color: isDarkMode ? '#bbbbbb' : COLORS.gray
                    }}>
                        Coming soon
                    </SafeText>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderAddressSelector = () => (
        <View style={[styles.section, { backgroundColor: isDarkMode ? '#1e1e1e' : COLORS.white }]}>
            <View style={styles.sectionHeader}>
                <SafeText style={{
                    fontSize: 18,
                    color: isDarkMode ? '#ffffff' : COLORS.secondary
                }}>
                    Delivery Address
                </SafeText>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('ManageAddress')}
                >
                    <Ionicons name="add-circle-outline" size={20} color={isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary} />
                    <SafeText style={{
                        marginLeft: 5,
                        fontSize: 14,
                        color: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                    }}>
                        Add New
                    </SafeText>
                </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
                <SafeText style={{
                    fontSize: 14,
                    marginTop: 10,
                    color: isDarkMode ? '#bbbbbb' : COLORS.gray
                }}>
                    No saved addresses. Please add a new address.
                </SafeText>
            ) : (
                addresses.map((address) => (
                    <TouchableOpacity
                        key={address._id}
                        style={[
                            styles.addressItem,
                            selectedAddress === address._id && {
                                borderColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary,
                                backgroundColor: isDarkMode ? 'rgba(42, 116, 226, 0.1)' : 'rgba(9, 64, 147, 0.05)'
                            }
                        ]}
                        onPress={() => setSelectedAddress(address._id)}
                    >
                        <View style={styles.addressDetails}>
                            <SafeText style={{
                                fontSize: 16,
                                marginBottom: 5,
                                color: isDarkMode ? '#ffffff' : COLORS.secondary
                            }}>
                                {address.name}
                            </SafeText>
                            <SafeText style={{
                                fontSize: 14,
                                color: isDarkMode ? '#bbbbbb' : COLORS.gray
                            }}>
                                {address.street}, {address.city}, {address.state}, {address.zipCode}
                            </SafeText>
                            <SafeText style={{
                                fontSize: 14,
                                marginTop: 5,
                                color: isDarkMode ? '#bbbbbb' : COLORS.gray
                            }}>
                                Phone: {address.phone}
                            </SafeText>
                        </View>
                        {selectedAddress === address._id && (
                            <Ionicons name="checkmark-circle" size={24} color={isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary} />
                        )}
                    </TouchableOpacity>
                ))
            )}
        </View>
    );

    const renderCartItem = (item, index) => {
        return (
            <View key={index} style={[styles.cartItem, { backgroundColor: isDarkMode ? '#242424' : COLORS.white }]}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.cartItemImage}
                    resizeMode="cover"
                />
                <View style={styles.cartItemDetails}>
                    <SafeText style={{
                        fontSize: 14,
                        marginBottom: 4,
                        color: isDarkMode ? '#ffffff' : COLORS.secondary
                    }} numberOfLines={2}>
                        {item.name}
                    </SafeText>
                    <View style={styles.priceContainer}>
                        <SafeText style={{
                            fontSize: 15,
                            color: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                        }}>
                            ₹{item.new_price}
                        </SafeText>
                        {item.old_price && (
                            <SafeText style={{
                                fontSize: 13,
                                marginLeft: 8,
                                textDecorationLine: 'line-through',
                                color: isDarkMode ? '#bbbbbb' : COLORS.gray
                            }}>
                                ₹{item.old_price}
                            </SafeText>
                        )}
                    </View>
                    <SafeText style={{
                        fontSize: 13,
                        marginTop: 4,
                        color: isDarkMode ? '#bbbbbb' : COLORS.gray
                    }}>
                        Qty: {item.quantity}
                    </SafeText>
                </View>
            </View>
        );
    };

    if (orderPlaced) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : COLORS.background }]}>
                <Header title="Order Confirmation" showBack={false} />
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {renderOrderSuccess()}
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : COLORS.background }]}>
                <Header title="Processing Order" showBack={false} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary} />
                    <SafeText style={{
                        fontSize: 18,
                        marginTop: 20,
                        color: isDarkMode ? '#ffffff' : COLORS.secondary
                    }}>
                        Processing your order...
                    </SafeText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : COLORS.background }]}>
            <Header title="Checkout" showBack={true} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Order Summary Section */}
                    <View style={[styles.section, { backgroundColor: isDarkMode ? '#1e1e1e' : COLORS.white }]}>
                        <SafeText style={{
                            fontSize: 18,
                            marginBottom: 15,
                            color: isDarkMode ? '#ffffff' : COLORS.secondary
                        }}>
                            Order Summary
                        </SafeText>

                        <View style={styles.cartItems}>
                            {cartItems.map((item, index) => renderCartItem(item, index))}
                        </View>

                        <View style={styles.summaryRow}>
                            <SafeText style={{
                                fontSize: 15,
                                color: isDarkMode ? '#ffffff' : COLORS.secondary
                            }}>
                                Subtotal:
                            </SafeText>
                            <SafeText style={{
                                fontSize: 15,
                                color: isDarkMode ? '#ffffff' : COLORS.secondary
                            }}>
                                ₹{totalAmount}
                            </SafeText>
                        </View>
                        <View style={styles.summaryRow}>
                            <SafeText style={{
                                fontSize: 15,
                                color: isDarkMode ? '#ffffff' : COLORS.secondary
                            }}>
                                Shipping:
                            </SafeText>
                            <SafeText style={{
                                fontSize: 15,
                                color: isDarkMode ? '#ffffff' : COLORS.secondary
                            }}>
                                Free
                            </SafeText>
                        </View>
                        <View style={styles.summaryRow}>
                            <SafeText style={{
                                fontSize: 16,
                                color: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                            }}>
                                Total:
                            </SafeText>
                            <SafeText style={{
                                fontSize: 16,
                                color: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                            }}>
                                ₹{totalAmount}
                            </SafeText>
                        </View>
                    </View>

                    {/* Address Selector Section */}
                    {renderAddressSelector()}

                    {/* Payment Method Selector */}
                    {renderPaymentMethodSelector()}

                    {/* Place Order Button */}
                    <TouchableOpacity
                        style={[styles.placeOrderButton, {
                            backgroundColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary,
                            opacity: selectedAddress ? 1 : 0.7
                        }]}
                        onPress={handlePlaceOrder}
                        disabled={!selectedAddress}
                    >
                        <SafeText style={{
                            fontSize: 16,
                            color: '#ffffff'
                        }}>
                            Place Order
                        </SafeText>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 30,
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
    loginButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    shopButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    section: {
        margin: 15,
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cartItems: {
        marginBottom: 15,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cartItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#f5f5f5',
    },
    cartItemDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    paymentOptions: {
        marginTop: 10,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    paymentDetails: {
        flex: 1,
        marginLeft: 10,
    },
    placeOrderButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 15,
        marginTop: 10,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    continueButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 20,
    },
    viewOrderButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'rgb(42, 116, 226)',
        marginTop: 10,
    },
});

export default CheckoutScreen; 