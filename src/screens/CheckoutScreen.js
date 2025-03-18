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

        // Debug product properties
        if (allProduct && allProduct.length > 0) {
            const sampleProduct = allProduct[0];
            console.log('Sample product structure:', {
                id: sampleProduct.id,
                _id: sampleProduct._id,
                name: sampleProduct.name,
                price: sampleProduct.price,
                new_price: sampleProduct.new_price,
                newPrice: sampleProduct.newPrice,
                image: sampleProduct.image ? 'Has image field' : 'No image field',
                images: sampleProduct.images ? 'Has images field' : 'No images field'
            });
        }
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

        if (addresses.length === 0) {
            Alert.alert(
                'No Address Found',
                'Please add address and pin first',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Profile', { screen: 'ManageAddress' })
                    }
                ]
            );
            return;
        }

        if (!selectedAddress) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        // Check if the selected address has a pincode
        if (!selectedAddress.pincode || selectedAddress.pincode.trim() === '' || selectedAddress.pincode === '000000') {
            Alert.alert(
                'Missing Pincode',
                'Please add a valid pincode for your delivery address',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Profile', { screen: 'ManageAddress' })
                    }
                ]
            );
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
                const productId = item.productId || item.id || item.product;

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
        console.log('Rendering cart item:', item);
        // Find the product in allProduct - the cart item uses productId field
        const productId = item.productId || item.id || item.product;
        let product = allProduct.find(p => p._id === productId || p.id === productId);
        console.log('Found product:', product);

        if (!product) {
            console.log('Product not found in allProduct. Item:', item);
            // Fall back to using cart item details
            return (
                <View style={[styles.cartItem, { backgroundColor: COLORS.white }]} key={index}>
                    <View style={styles.productImageContainer}>
                        <View style={styles.productPlaceholder}>
                            <Ionicons name="cube-outline" size={24} color={COLORS.gray} />
                        </View>
                    </View>
                    <View style={styles.productContent}>
                        <Text style={[styles.productName, { color: COLORS.secondary }]} numberOfLines={1} ellipsizeMode="tail">
                            {item.name || 'Unknown Product'}
                        </Text>
                        <View style={styles.productDetails}>
                            <Text style={[styles.productQuantity, { color: COLORS.gray }]}>Qty: {item.quantity}</Text>
                            <Text style={[styles.productPrice, { color: COLORS.primary }]}>₹{item.price * item.quantity}</Text>
                        </View>
                    </View>
                </View>
            );
        }

        // Calculate total price - handling different field names
        const price = product.new_price || product.newPrice || product.price || 0;
        const totalPrice = price * item.quantity;

        // Get product image - handling different field structures
        let productImage = null;
        if (product.image) {
            productImage = Array.isArray(product.image) ? product.image[0] : product.image;
        } else if (product.images && product.images.length > 0) {
            productImage = Array.isArray(product.images) ? product.images[0] : product.images;
        }

        return (
            <View style={[styles.cartItem, { backgroundColor: COLORS.white }]} key={index}>
                <View style={styles.productImageContainer}>
                    {productImage ? (
                        <Image
                            source={{ uri: productImage }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.productPlaceholder}>
                            <Ionicons name="image-outline" size={24} color={COLORS.gray} />
                        </View>
                    )}
                </View>
                <View style={styles.productContent}>
                    <Text style={[styles.productName, { color: COLORS.secondary }]} numberOfLines={1} ellipsizeMode="tail">
                        {product.name || item.name || 'Unknown Product'}
                    </Text>
                    <View style={styles.productDetails}>
                        <Text style={[styles.productQuantity, { color: COLORS.gray }]}>Qty: {item.quantity}</Text>
                        <Text style={[styles.productPrice, { color: COLORS.primary }]}>₹{totalPrice}</Text>
                    </View>
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
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                            Order Summary
                        </Text>
                        <Text style={[styles.sectionSubtitle, { color: COLORS.gray }]}>
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                        </Text>
                    </View>
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
                            onPress={() => navigation.navigate('Profile', { screen: 'ManageAddress' })}
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
                            style={[styles.paymentOption, styles.activePaymentOption]}
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
                            <View style={styles.paymentOptionContent}>
                                <View style={styles.paymentOptionHeader}>
                                    <Text style={[styles.paymentOptionText, { color: COLORS.secondary }]}>
                                        Cash on Delivery
                                    </Text>
                                    <View style={[styles.availableChip, { backgroundColor: COLORS.success }]}>
                                        <Text style={styles.availableText}>Available</Text>
                                    </View>
                                </View>
                                <Text style={styles.paymentOptionSubtext}>
                                    Pay when your order is delivered
                                </Text>
                            </View>
                            <Ionicons name="cash-outline" size={24} color={COLORS.secondary} style={styles.paymentIcon} />
                        </TouchableOpacity>

                        {/* UPI Payment - Disabled */}
                        <View style={[styles.paymentOption, styles.disabledPaymentOption]}>
                            <View style={[
                                styles.radioButton,
                                { borderColor: COLORS.gray }
                            ]}>
                                {/* Empty radio button */}
                            </View>
                            <View style={styles.paymentOptionContent}>
                                <View style={styles.paymentOptionHeader}>
                                    <Text style={[styles.paymentOptionText, { color: COLORS.gray }]}>
                                        UPI
                                    </Text>
                                    <View style={[styles.notAvailableChip, { backgroundColor: COLORS.error }]}>
                                        <Text style={styles.notAvailableText}>Not Available</Text>
                                    </View>
                                </View>
                                <Text style={styles.paymentOptionSubtext}>
                                    GPay / PhonePe / Paytm / BHIM UPI (Coming Soon)
                                </Text>
                            </View>
                            <Ionicons name="phone-portrait-outline" size={24} color={COLORS.gray} style={styles.paymentIcon} />
                        </View>

                        {/* Credit/Debit Card - Disabled */}
                        <View style={[styles.paymentOption, styles.disabledPaymentOption]}>
                            <View style={[
                                styles.radioButton,
                                { borderColor: COLORS.gray }
                            ]}>
                                {/* Empty radio button */}
                            </View>
                            <View style={styles.paymentOptionContent}>
                                <View style={styles.paymentOptionHeader}>
                                    <Text style={[styles.paymentOptionText, { color: COLORS.gray }]}>
                                        Credit / Debit Card
                                    </Text>
                                    <View style={[styles.notAvailableChip, { backgroundColor: COLORS.error }]}>
                                        <Text style={styles.notAvailableText}>Not Available</Text>
                                    </View>
                                </View>
                                <Text style={styles.paymentOptionSubtext}>
                                    Visa, MasterCard, Rupay & more (Coming Soon)
                                </Text>
                            </View>
                            <Ionicons name="card-outline" size={24} color={COLORS.gray} style={styles.paymentIcon} />
                        </View>
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
    sectionSubtitle: {
        fontSize: 14,
        color: '#888',
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
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#f5f5f5',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        width: '80%', // Ensure long names don't overflow
    },
    productDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    productQuantity: {
        fontSize: 13,
    },
    productPrice: {
        fontSize: 15,
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
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    activePaymentOption: {
        opacity: 1,
    },
    paymentOptionContent: {
        flex: 1,
        marginLeft: 10,
    },
    paymentOptionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    paymentOptionSubtext: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    paymentIcon: {
        marginLeft: 10,
    },
    disabledPaymentOption: {
        opacity: 0.6,
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
    paymentOptionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    notAvailableChip: {
        backgroundColor: '#ff6666',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 5,
    },
    notAvailableText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    availableChip: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 5,
    },
    availableText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});

export default CheckoutScreen; 