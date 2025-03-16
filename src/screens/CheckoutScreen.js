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
    Image
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

const CheckoutScreen = ({ navigation }) => {
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const { cartItems, getTotalCartAmount, clearCart, allProduct } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    // Calculate total amount
    const totalAmount = getTotalCartAmount();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && user._id) {
            fetchAddresses();
        }
    }, [user]);

    // Log cart items for debugging
    useEffect(() => {
        console.log('Cart items in checkout:', cartItems);
        console.log('All products in checkout:', allProduct);
    }, [cartItems, allProduct]);

    const fetchAddresses = async () => {
        try {
            // Ensure token is properly formatted with Bearer prefix
            const token = user.token;
            if (!token) {
                throw new Error('Authentication token is missing');
            }

            console.log('Using token for auth:', token.substring(0, 10) + '...');

            const response = await axios.get(`https://a-kart-backend.onrender.com/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });

            console.log('User data response:', response.data);

            // Set addresses and pincodes from user data
            const userData = response.data;
            const userAddresses = userData.address || [];
            const userPincodes = userData.pincode || [];

            // Create formatted addresses for display
            const formattedAddresses = userAddresses.map((address, index) => ({
                address: address,
                pincode: userPincodes[index] || '000000' // Use pincode if available or default
            }));

            setAddresses(formattedAddresses);
            if (formattedAddresses.length > 0) {
                setSelectedAddress(formattedAddresses[0]);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to load addresses. Please try again.');
        }
    };

    const handlePlaceOrder = async () => {
        if (!user || !user._id || !user.token) {
            Alert.alert('Error', 'You must be logged in to place an order');
            navigation.navigate('Login');
            return;
        }

        if (!selectedAddress) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        if (cartItems.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }

        setIsLoading(true);
        try {
            // Ensure token is properly formatted with Bearer prefix
            const token = user.token;
            if (!token) {
                throw new Error('Authentication token is missing');
            }

            // Prepare order items
            const items = cartItems.map(item => {
                // Use the productId directly from the cart item
                const productId = item.productId || item.id;

                // Find the product in allProduct array
                const product = allProduct.find(p =>
                    p._id === productId || p.id === productId
                );

                console.log('Cart item for order:', item);
                console.log('Product ID for order:', productId);
                console.log('Found product for order:', product);

                if (!product) {
                    console.log('Product not found in allProduct array');
                    return {
                        productId: productId,
                        quantity: item.quantity || 1
                    };
                }

                // Ensure all required fields are present
                return {
                    productId: productId,
                    quantity: item.quantity || 1
                };
            });

            console.log('Order items:', items);
            console.log('Selected address:', selectedAddress);

            // Validate pincode and use default if missing
            let orderPincode = selectedAddress.pincode;
            if (!orderPincode || orderPincode.trim() === '') {
                // Use default pincode
                orderPincode = '000000';
                console.log('Using default pincode:', orderPincode);
            }

            // Create order with fields that match the backend model
            const orderData = {
                userId: user._id,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                totalAmount: totalAmount,
                address: selectedAddress.address,
                pincode: orderPincode,
                paymentMethod: paymentMethod,
                orderStatus: 'pending'
            };

            // Ensure all fields are properly formatted
            if (typeof orderData.userId !== 'string') {
                orderData.userId = String(orderData.userId);
            }

            if (typeof orderData.totalAmount !== 'number') {
                orderData.totalAmount = Number(totalAmount);
            }

            if (typeof orderData.address !== 'string') {
                orderData.address = String(orderData.address);
            }

            if (typeof orderData.pincode !== 'string') {
                orderData.pincode = String(orderData.pincode);
            }

            console.log('Placing order with data:', JSON.stringify(orderData, null, 2));

            const response = await axios.post(
                'https://a-kart-backend.onrender.com/order/createorder',
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            console.log('Order response:', response.data);

            // Clear cart after successful order
            await clearCart();

            // Show success message with only Continue Shopping option
            Alert.alert(
                'Success',
                'Your order has been placed successfully!',
                [
                    {
                        text: 'Continue Shopping',
                        onPress: () => navigation.navigate('Home')
                    }
                ]
            );
        } catch (error) {
            console.error('Error placing order:', error.response?.data || error.message || error);

            // More detailed error message
            let errorMessage = 'Failed to place order. Please try again.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;

                // If the error is about missing fields, try to provide more context
                if (errorMessage.includes('Missing required fields')) {
                    errorMessage += '. Please check your address and payment information.';
                }
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderCartItem = (item, index) => {
        // Find the product in allProduct array using both _id and id fields
        const productId = item.productId || item.id;
        const product = allProduct.find(p =>
            (p._id === productId || p.id === productId)
        );

        // Log for debugging
        console.log(`Rendering cart item ${index}:`, item);
        console.log(`Looking for product with ID: ${productId}`);
        console.log(`Found product:`, product);

        // If product not found, show basic info from cart item
        if (!product) {
            return (
                <View key={index} style={[styles.cartItem, { backgroundColor: COLORS.white }]}>
                    <Text style={[styles.productName, { color: COLORS.secondary }]} numberOfLines={1}>
                        {item.name || `Product ID: ${productId}`}
                    </Text>
                    <View style={styles.productDetails}>
                        <Text style={[styles.productQuantity, { color: COLORS.gray }]}>
                            Qty: {item.quantity}
                        </Text>
                        <Text style={[styles.productPrice, { color: COLORS.primary }]}>
                            ₹{item.price * item.quantity}
                        </Text>
                    </View>
                </View>
            );
        }

        // Calculate the price
        const price = product.new_price || product.price || 0;
        const totalPrice = price * item.quantity;

        return (
            <View key={index} style={[styles.cartItem, { backgroundColor: COLORS.white }]}>
                <Text style={[styles.productName, { color: COLORS.secondary }]} numberOfLines={1}>
                    {product.name}
                </Text>
                <View style={styles.productDetails}>
                    <Text style={[styles.productQuantity, { color: COLORS.gray }]}>
                        Qty: {item.quantity}
                    </Text>
                    <Text style={[styles.productPrice, { color: COLORS.primary }]}>
                        ₹{totalPrice}
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
                <Header title="Checkout" showBack={true} onBackPress={() => navigation.goBack()} />
                <View style={styles.emptyStateContainer}>
                    <Image
                        source={require('../../public/assets/emptycart.png')}
                        style={styles.emptyStateImage}
                    />
                    <Text style={[styles.emptyStateText, { color: COLORS.secondary }]}>
                        Please login to checkout
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

    if (cartItems.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: COLORS.background }]}>
                <Header title="Checkout" showBack={true} onBackPress={() => navigation.goBack()} />
                <View style={styles.emptyStateContainer}>
                    <Image
                        source={require('../../public/assets/emptycart.png')}
                        style={styles.emptyStateImage}
                    />
                    <Text style={[styles.emptyStateText, { color: COLORS.secondary }]}>
                        Your cart is empty
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
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: COLORS.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <Header title="Checkout" showBack={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Order Summary */}
                <View style={[styles.section, { backgroundColor: COLORS.white }]}>
                    <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                        Order Summary
                    </Text>
                    <View style={styles.cartItems}>
                        {cartItems.map((item, index) => renderCartItem(item, index))}
                    </View>
                    <View style={[styles.divider, { backgroundColor: COLORS.lightGray }]} />
                    <View style={styles.totalContainer}>
                        <Text style={[styles.totalLabel, { color: COLORS.secondary }]}>
                            Total Amount:
                        </Text>
                        <Text style={[styles.totalAmount, { color: COLORS.primary }]}>
                            ₹{totalAmount}
                        </Text>
                    </View>
                </View>

                {/* Delivery Address */}
                <View style={[styles.section, { backgroundColor: COLORS.white }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                            Delivery Address
                        </Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('ManageAddress')}
                        >
                            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                            <Text style={[styles.addButtonText, { color: COLORS.primary }]}>
                                Manage Addresses
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.addressList}>
                        {addresses.length === 0 ? (
                            <Text style={[styles.noAddressText, { color: COLORS.gray }]}>
                                No addresses found. Please add a delivery address.
                            </Text>
                        ) : (
                            addresses.map((address, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.addressItem,
                                        selectedAddress === address && {
                                            borderColor: COLORS.primary,
                                            borderWidth: 2
                                        }
                                    ]}
                                    onPress={() => setSelectedAddress(address)}
                                >
                                    <View style={styles.addressRadio}>
                                        <View style={[
                                            styles.radioButton,
                                            { borderColor: COLORS.primary }
                                        ]}>
                                            {selectedAddress === address && (
                                                <View style={[
                                                    styles.radioButtonSelected,
                                                    { backgroundColor: COLORS.primary }
                                                ]} />
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.addressDetails}>
                                        <Text style={[styles.addressText, { color: COLORS.secondary }]}>
                                            {address.address}
                                        </Text>
                                        <Text style={[styles.addressText, { color: COLORS.gray }]}>
                                            Pincode: {address.pincode}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </View>

                {/* Payment Method */}
                <View style={[styles.section, { backgroundColor: COLORS.white }]}>
                    <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                        Payment Method
                    </Text>
                    <View style={styles.paymentOptions}>
                        <TouchableOpacity
                            style={styles.paymentOption}
                            onPress={() => setPaymentMethod('COD')}
                        >
                            <View style={[
                                styles.radioButton,
                                { borderColor: COLORS.primary }
                            ]}>
                                {paymentMethod === 'COD' && (
                                    <View style={[
                                        styles.radioButtonSelected,
                                        { backgroundColor: COLORS.primary }
                                    ]} />
                                )}
                            </View>
                            <Text style={[styles.paymentOptionText, { color: COLORS.secondary }]}>
                                Cash on Delivery
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Place Order Button */}
                <TouchableOpacity
                    style={[
                        styles.placeOrderButton,
                        { backgroundColor: COLORS.primary },
                        isLoading && { opacity: 0.7 }
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                        <Text style={[styles.placeOrderButtonText, { color: COLORS.white }]}>
                            Place Order
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '500',
    },
    cartItems: {
        marginBottom: 15,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        marginRight: 10,
    },
    productDetails: {
        alignItems: 'flex-end',
    },
    productQuantity: {
        fontSize: 12,
        marginBottom: 3,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        marginVertical: 10,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    addressList: {
        marginTop: 10,
    },
    noAddressText: {
        textAlign: 'center',
        fontSize: 14,
        marginVertical: 15,
    },
    addressItem: {
        flexDirection: 'row',
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 10,
    },
    addressRadio: {
        marginRight: 15,
        justifyContent: 'center',
    },
    radioButton: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        height: 10,
        width: 10,
        borderRadius: 5,
    },
    addressDetails: {
        flex: 1,
    },
    addressText: {
        fontSize: 14,
        marginBottom: 3,
    },
    paymentOptions: {
        marginTop: 10,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    paymentOptionText: {
        fontSize: 16,
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
    placeOrderButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CheckoutScreen; 