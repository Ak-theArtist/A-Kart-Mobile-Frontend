import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import { Alert } from 'react-native';
import axios from 'axios';

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
    const [allProduct, setAllProduct] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all products
    const fetchProducts = async () => {
        try {
            console.log('Fetching products...');
            setIsLoading(true);
            const response = await api.get('/product/allproducts');
            console.log('Products fetched successfully:', response.data.length);
            setAllProduct(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products. The server might be starting up, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user data and cart
    const fetchUserIdAndCart = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                console.log('Using token for auth in ShopContext:', token.substring(0, 10) + '...');

                // Set auth header for all future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const userResponse = await api.get('/auth/me', {
                    withCredentials: true
                });

                const user = userResponse.data;
                setUserId(user._id);
                setUserRole(user.role);

                // Fetch cart data
                await fetchCartData(user._id);
            }
        } catch (error) {
            console.error('Error fetching user ID or cart items:', error);
            // Load local cart if available
            const storedCart = await AsyncStorage.getItem('cartItems');
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
        }
    };

    const fetchCartData = async (id) => {
        try {
            const cartResponse = await api.get(`/auth/cart/${id}`);
            if (cartResponse.data && cartResponse.data.cart) {
                setCartItems(cartResponse.data.cart);
            }
        } catch (error) {
            console.error('Error fetching cart data:', error);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            await fetchProducts();
            await fetchUserIdAndCart();
        };

        initializeData();
    }, []);

    const addToCart = async (productId) => {
        try {
            if (!userId) {
                // Handle guest cart
                const updatedCart = [...cartItems];
                const cartItem = updatedCart.find(item => item.productId === productId);
                if (cartItem) {
                    cartItem.quantity += 1;
                } else {
                    updatedCart.push({ productId, quantity: 1 });
                }
                setCartItems(updatedCart);
                await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
                return;
            }

            // Handle logged-in user cart
            const response = await api.post(
                `/auth/addtocart/${userId}`,
                { productId }
            );

            if (response.data && response.data.cart) {
                setCartItems(response.data.cart);
                console.log('Item added to cart:', response.data.cart);
            }
        } catch (error) {
            console.error('Error adding item to cart:', error);
            Alert.alert('Error', 'Failed to add item to cart. Please try again.');
        }
    };

    const removeFromCart = async (productId) => {
        try {
            if (!userId) {
                // Handle guest cart
                const updatedCart = cartItems.filter(item => item.productId !== productId);
                setCartItems(updatedCart);
                await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
                return;
            }

            // Handle logged-in user cart
            const response = await api.post(
                `/auth/removefromcart/${userId}`,
                { productId }
            );

            if (response.data && response.data.cart) {
                setCartItems(response.data.cart);
                console.log('Item removed from cart:', response.data.cart);
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
            Alert.alert('Error', 'Failed to remove item from cart. Please try again.');
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        cartItems.forEach((item) => {
            const productId = item.productId || item.id;
            const product = allProduct.find((p) => p._id === productId || p.id === productId);
            if (product) {
                const price = product.new_price || product.price || 0;
                totalAmount += item.quantity * price;
            }
        });
        return totalAmount;
    };

    const getTotalCartItems = () => {
        let totalItems = 0;
        if (!cartItems || cartItems.length === 0) {
            return totalItems;
        }

        cartItems.forEach((item) => {
            if (item && item.quantity) {
                totalItems += item.quantity;
            } else if (item) {
                // If quantity is not defined, assume 1
                totalItems += 1;
            }
        });
        return totalItems;
    };

    const syncLocalCartToServer = async () => {
        if (userId) {
            try {
                const localCart = JSON.parse(await AsyncStorage.getItem('cartItems')) || [];
                if (localCart.length > 0) {
                    for (const item of localCart) {
                        for (let i = 0; i < item.quantity; i++) {
                            await addToCart(item.productId);
                        }
                    }
                    await AsyncStorage.removeItem('cartItems');
                }
            } catch (error) {
                console.error('Error syncing local cart to server:', error);
            }
        }
    };

    const clearCart = async () => {
        try {
            // Only handle local cart clearing
            setCartItems([]);
            await AsyncStorage.setItem('cartItems', JSON.stringify([]));
            console.log('Cart cleared successfully');
        } catch (error) {
            console.log('Error clearing cart:', error);
        }
    };

    // Update cart item quantity
    const updateCartItemCount = async (productId, newQuantity) => {
        try {
            // Remove item if quantity is 0 or less
            if (newQuantity <= 0) {
                removeFromCart(productId);
                return;
            }

            if (!userId) {
                // Handle guest cart
                const updatedCart = [...cartItems];
                const cartItem = updatedCart.find(item => item.productId === productId);
                if (cartItem) {
                    cartItem.quantity = newQuantity;
                    setCartItems(updatedCart);
                    await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
                }
                return;
            }

            // For logged-in users, we'll use the existing endpoints
            // First, remove the item completely
            await removeFromCart(productId);

            // Then add it back with the new quantity
            for (let i = 0; i < newQuantity; i++) {
                await addToCart(productId);
            }

            // Refresh the cart
            await fetchCartData(userId);

        } catch (error) {
            console.error('Error updating cart item:', error);
            Alert.alert('Error', 'Failed to update cart item. Please try again.');
        }
    };

    useEffect(() => {
        if (userId) {
            syncLocalCartToServer();
        }
    }, [userId]);

    const contextValue = {
        allProduct,
        setAllProduct,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemCount,
        getTotalCartAmount,
        getTotalCartItems,
        userId,
        userRole,
        syncLocalCartToServer,
        isLoading,
        setIsLoading,
        error,
        fetchProducts,
        clearCart
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider; 