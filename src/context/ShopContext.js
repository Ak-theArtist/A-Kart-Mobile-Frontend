import React, { createContext, useEffect, useState, useRef } from 'react';
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

    // Create a ref to the context values
    const contextRef = useRef(null);

    // Set up the ref to this context's internal methods
    useEffect(() => {
        // Create object with methods you want to expose
        const contextMethods = {
            setCartItems,
            fetchCartData,
            refreshCart
        };

        // Update the ref
        contextRef.current = contextMethods;

        // Make it globally accessible for direct updates
        global.shopContextRef = contextRef;

        return () => {
            // Clean up global ref when unmounted
            if (global.shopContextRef === contextRef) {
                global.shopContextRef = null;
            }
        };
    }, []);

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
            console.log('Initializing shop context and fetching user/cart data...');

            // Always reset cart state first to ensure no data persists between sessions
            setCartItems([]);

            // Clear user ID from state to prevent stale references
            setUserId(null);

            // Now check if user is logged in
            const token = await AsyncStorage.getItem('token');
            if (token) {
                console.log('User is logged in. Using token for auth in ShopContext:', token.substring(0, 10) + '...');

                // Set auth header for all future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                try {
                    // Get user data - IMPORTANT: Must be a fresh request every time
                    const userResponse = await api.get('/auth/me', {
                        withCredentials: true
                    });

                    const user = userResponse.data;
                    console.log(`User authenticated: ${user.name} (${user._id}), Role: ${user.role}`);

                    // Store user ID in AsyncStorage for consistent access
                    await AsyncStorage.setItem('userId', user._id);

                    // Set user data in state
                    setUserId(user._id);
                    setUserRole(user.role);

                    // Fetch cart data from server - for logged in users, server cart takes priority
                    console.log(`Fetching cart data for user ${user._id}...`);

                    // CRITICAL: This needs to be a direct API call to get fresh data every time
                    const cartResponse = await api.get(`/auth/cart/${user._id}`);

                    if (cartResponse.data && cartResponse.data.cart) {
                        console.log(`Received cart data for user ${user._id}:`, cartResponse.data.cart);

                        // Set cart data directly from this fresh response
                        setCartItems(cartResponse.data.cart);

                        // Update local storage
                        await AsyncStorage.setItem('cartItems', JSON.stringify(cartResponse.data.cart));
                    } else {
                        console.log('No cart data received from server or invalid format');
                        setCartItems([]);
                        await AsyncStorage.setItem('cartItems', JSON.stringify([]));
                    }
                } catch (userError) {
                    console.error('Error getting user data:', userError);
                    // Clear any lingering local cart data to be safe
                    await AsyncStorage.setItem('cartItems', JSON.stringify([]));

                    // Clear user ID to prevent incorrect API calls
                    await AsyncStorage.removeItem('userId');
                    setUserId(null);
                }
            } else {
                console.log('No user token found, using guest mode');

                // Clear user ID to prevent incorrect API calls
                await AsyncStorage.removeItem('userId');
                setUserId(null);

                // Only set local cart if user is not logged in
                const storedCart = await AsyncStorage.getItem('cartItems');
                const localCart = storedCart ? JSON.parse(storedCart) : [];

                if (localCart.length > 0) {
                    console.log('Found local cart with', localCart.length, 'items');
                    setCartItems(localCart);
                } else {
                    console.log('No local cart found or cart is empty');
                }
            }
        } catch (error) {
            console.error('Error initializing shop context:', error);

            // Clear user ID to prevent incorrect API calls
            await AsyncStorage.removeItem('userId');
            setUserId(null);

            // Fallback to local cart in case of error
            const storedCart = await AsyncStorage.getItem('cartItems');
            const localCart = storedCart ? JSON.parse(storedCart) : [];
            if (localCart.length > 0) {
                console.log('Using fallback local cart with', localCart.length, 'items');
                setCartItems(localCart);
            }
        }
    };

    const fetchCartData = async (id) => {
        try {
            // Get the current user ID from state or AsyncStorage
            const currentUserId = userId || await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');

            // Safety checks
            if (!id || !currentUserId || !token) {
                console.log(`Missing data for cart fetch: id=${id}, currentUserId=${currentUserId}, token=${!!token}`);
                setCartItems([]);
                return;
            }

            // Only proceed if the requested ID matches the current user ID
            if (id !== currentUserId) {
                console.log(`User ID mismatch: requested ${id} but current user is ${currentUserId}`);
                console.log('Skipping cart fetch to prevent data leakage between users');
                setCartItems([]);
                return;
            }

            console.log(`Fetching cart data for user: ${id}`);

            // Ensure we have the correct authorization header set
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const cartResponse = await api.get(`/auth/cart/${id}`);

            if (cartResponse.data && cartResponse.data.cart) {
                console.log(`Received cart data for user ${id}:`, cartResponse.data.cart);

                // Update cart state with server data
                setCartItems(cartResponse.data.cart);

                // Update AsyncStorage with the server cart
                await AsyncStorage.setItem('cartItems', JSON.stringify(cartResponse.data.cart));
            } else {
                console.log('No cart data received from server or invalid format');
                setCartItems([]);
                await AsyncStorage.setItem('cartItems', JSON.stringify([]));
            }
        } catch (error) {
            console.error('Error fetching cart data:', error);
            // Clear cart on error to prevent stale data
            setCartItems([]);
            await AsyncStorage.setItem('cartItems', JSON.stringify([]));
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            console.log('ShopContext: Initializing data');
            try {
                // First, fetch products
                await fetchProducts();

                // Then fetch user ID and cart data
                await fetchUserIdAndCart();

                // Important: If user is logged in, explicitly fetch the latest cart
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    console.log('ShopContext: User is logged in, explicitly refreshing cart data');
                    await refreshCart();
                }
            } catch (error) {
                console.error('Error in ShopContext initialization:', error);
            }
        };

        initializeData();
    }, []);

    const addToCart = async (productId) => {
        try {
            // Get fresh user data from server to ensure current user
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                // Handle guest cart
                console.log('No token, using guest cart for addition');
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

            // Set fresh auth header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Get current user from server to ensure we have the right ID
            const userResponse = await api.get('/auth/me');
            const currentUser = userResponse.data;

            if (!currentUser || !currentUser._id) {
                console.error('Could not verify current user');
                return;
            }

            const currentUserId = currentUser._id;

            // Update the user ID in state and storage to ensure consistency
            setUserId(currentUserId);
            await AsyncStorage.setItem('userId', currentUserId);

            console.log(`Adding item ${productId} for verified user ${currentUserId}`);

            // Make the API call with verified user ID
            const response = await api.post(
                `/auth/addtocart/${currentUserId}`,
                { productId }
            );

            if (response.data && response.data.cart) {
                console.log(`Cart updated after addition for user ${currentUserId}:`, response.data.cart);
                setCartItems(response.data.cart);
                await AsyncStorage.setItem('cartItems', JSON.stringify(response.data.cart));
            } else {
                console.error('Invalid response format from addToCart:', response.data);
            }

            // Verify the cart was updated by fetching it again
            const verifyResponse = await api.get(`/auth/cart/${currentUserId}`);
            if (verifyResponse.data && verifyResponse.data.cart) {
                console.log(`Verified cart state after addition:`, verifyResponse.data.cart);
            }

        } catch (error) {
            console.error('Error adding item to cart:', error);
            Alert.alert('Error', 'Failed to add item to cart. Please try again.');
        }
    };

    const removeFromCart = async (productId) => {
        try {
            // Get fresh user data from server to ensure current user
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                // Handle guest cart
                console.log('No token, using guest cart for removal');
                const updatedCart = cartItems.filter(item => item.productId !== productId);
                setCartItems(updatedCart);
                await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
                return;
            }

            // Set fresh auth header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Get current user from server to ensure we have the right ID
            const userResponse = await api.get('/auth/me');
            const currentUser = userResponse.data;

            if (!currentUser || !currentUser._id) {
                console.error('Could not verify current user');
                return;
            }

            const currentUserId = currentUser._id;

            // Update the user ID in state and storage to ensure consistency
            setUserId(currentUserId);
            await AsyncStorage.setItem('userId', currentUserId);

            console.log(`Removing item ${productId} for verified user ${currentUserId}`);

            // Make the API call with verified user ID
            const response = await api.post(
                `/auth/removefromcart/${currentUserId}`,
                { productId }
            );

            if (response.data && response.data.cart) {
                console.log(`Cart updated after removal for user ${currentUserId}:`, response.data.cart);
                setCartItems(response.data.cart);
                await AsyncStorage.setItem('cartItems', JSON.stringify(response.data.cart));
            } else {
                console.error('Invalid response format from removeFromCart:', response.data);
            }

            // Verify the cart was updated by fetching it again
            const verifyResponse = await api.get(`/auth/cart/${currentUserId}`);
            if (verifyResponse.data && verifyResponse.data.cart) {
                console.log(`Verified cart state after removal:`, verifyResponse.data.cart);
            }

        } catch (error) {
            console.error('Error removing item from cart:', error);
            Alert.alert('Error', 'Failed to remove item from cart. Please try again.');
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        cartItems.forEach((item) => {
            const productId = item.productId || item.id || item.product;
            const product = allProduct.find((p) => p._id === productId || p.id === productId);
            if (product) {
                // Handle different price field names
                const price = product.new_price || product.newPrice || product.price || 0;
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
                // First get local cart
                const localCart = JSON.parse(await AsyncStorage.getItem('cartItems')) || [];

                // If we have items in the local cart, merge with server cart
                if (localCart.length > 0) {
                    console.log('Syncing local cart to server:', localCart);

                    // First, fetch the current server cart to make sure we have the latest
                    await fetchCartData(userId);

                    // Get current server cart
                    const currentServerCart = [...cartItems];

                    // For each item in the local cart
                    for (const item of localCart) {
                        // Check if the item is already in the server cart
                        const existingItem = currentServerCart.find(
                            serverItem => serverItem.productId === item.productId
                        );

                        if (existingItem) {
                            // If item exists, add the additional quantity
                            for (let i = 0; i < item.quantity; i++) {
                                await addToCart(item.productId);
                            }
                        } else {
                            // If item doesn't exist, add it with its quantity
                            for (let i = 0; i < item.quantity; i++) {
                                await addToCart(item.productId);
                            }
                        }
                    }

                    // Clear the local cart after successful sync
                    await AsyncStorage.setItem('cartItems', JSON.stringify([]));
                    console.log('Local cart synced to server and cleared');
                } else {
                    // If local cart is empty, just fetch the server cart
                    await fetchCartData(userId);
                }
            } catch (error) {
                console.error('Error syncing local cart to server:', error);
                // In case of error, we'll keep the local cart for now
            }
        }
    };

    const clearCart = async () => {
        try {
            console.log('Clearing cart...');

            // Clear cart items in state immediately
            setCartItems([]);

            // Always clear local storage regardless of user status
            await AsyncStorage.setItem('cartItems', JSON.stringify([]));

            // Always get the latest token and userId from AsyncStorage for fresh authentication
            const token = await AsyncStorage.getItem('token');
            const storedUserId = await AsyncStorage.getItem('userId');

            // Use the most reliable user ID source
            const currentUserId = storedUserId || userId;

            if (!currentUserId || !token) {
                console.log('No user ID or token available - guest cart cleared');
                return;
            }

            console.log(`Attempting to clear server cart for user ${currentUserId}...`);

            // Set/refresh the authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // For logged-in users, try to clear server cart
            try {
                // Try to use the clear cart endpoint if it exists
                const response = await api.delete(`/order/clearcart/${currentUserId}`);
                if (response.data && response.data.success) {
                    console.log(`Server cart cleared successfully for user ${currentUserId}`);
                    return;
                }
            } catch (apiError) {
                console.log('Clear cart API error:', apiError);
                console.log('Falling back to manual cart clearing...');

                // Fallback: Try to clear by removing each item individually
                try {
                    const currentCart = [...cartItems];
                    console.log(`Attempting to clear ${currentCart.length} items from cart...`);

                    for (const item of currentCart) {
                        await removeFromCart(item.productId);
                    }
                    console.log(`Cart cleared item by item for user ${currentUserId}`);
                } catch (removeError) {
                    console.error('Error removing items one by one:', removeError);
                }
            }

            // Final verification of empty cart
            try {
                console.log(`Verifying cart is empty for user ${currentUserId}...`);
                const cartResponse = await api.get(`/auth/cart/${currentUserId}`);

                if (cartResponse.data && cartResponse.data.cart && cartResponse.data.cart.length > 0) {
                    console.log('Warning: Cart still contains items after clearing attempt:', cartResponse.data.cart);
                } else {
                    console.log('Verification successful: Cart is empty');
                }
            } catch (verifyError) {
                console.error('Error verifying cart is empty:', verifyError);
            }

        } catch (error) {
            console.error('Error clearing cart:', error);
            // Final fallback - at least clear the local state and storage
            setCartItems([]);
            await AsyncStorage.setItem('cartItems', JSON.stringify([]));
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

            // Make sure local storage is updated with the latest cart
            const latestCart = await api.get(`/auth/cart/${userId}`);
            if (latestCart.data && latestCart.data.cart) {
                await AsyncStorage.setItem('cartItems', JSON.stringify(latestCart.data.cart));
            }
        } catch (error) {
            console.error('Error updating cart item:', error);
            Alert.alert('Error', 'Failed to update cart item. Please try again.');
        }
    };

    // Watch for user ID changes and clear cart when user changes
    useEffect(() => {
        // If userId becomes null (user logged out) or changes to a different user,
        // make sure we have a clean cart state
        const clearCartOnUserChange = async () => {
            console.log('User ID changed, resetting cart state');

            // Clear cart items in state immediately
            setCartItems([]);

            // Clear AsyncStorage cart data
            await AsyncStorage.setItem('cartItems', JSON.stringify([]));

            // If we have a user ID, fetch their cart from the server
            if (userId) {
                console.log(`Fetching fresh cart data for user: ${userId}`);
                await fetchCartData(userId);
            }
        };

        clearCartOnUserChange();
    }, [userId]);

    useEffect(() => {
        if (userId) {
            syncLocalCartToServer();
        }
    }, [userId]);

    // Add a dedicated function to refresh the cart with latest data
    const refreshCart = async () => {
        try {
            // Get fresh authentication data
            const token = await AsyncStorage.getItem('token');
            const storedUserId = await AsyncStorage.getItem('userId');

            if (!token || !storedUserId) {
                console.log('No authentication data for cart refresh');
                setCartItems([]);
                return;
            }

            console.log(`Explicitly refreshing cart for user ${storedUserId}`);

            // Set token header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Get up-to-date user info
            const userResponse = await api.get('/auth/me');
            if (!userResponse.data || !userResponse.data._id) {
                console.log('Invalid user data from /auth/me during refresh');
                return;
            }

            const freshUserId = userResponse.data._id;

            // If needed, update the UserId in state and storage
            if (freshUserId !== storedUserId) {
                console.log(`Updating user ID from ${storedUserId} to ${freshUserId}`);
                setUserId(freshUserId);
                await AsyncStorage.setItem('userId', freshUserId);
            }

            // Fetch cart with verified user
            console.log(`Fetching latest cart for ${freshUserId}`);
            const cartResponse = await api.get(`/auth/cart/${freshUserId}`);

            if (cartResponse.data && cartResponse.data.cart) {
                console.log('Cart refreshed with latest data:', cartResponse.data.cart);
                setCartItems(cartResponse.data.cart);
                await AsyncStorage.setItem('cartItems', JSON.stringify(cartResponse.data.cart));
            } else {
                console.log('Empty or invalid cart data received during refresh');
                setCartItems([]);
                await AsyncStorage.setItem('cartItems', JSON.stringify([]));
            }
        } catch (error) {
            console.error('Error refreshing cart:', error);
            // On error, clear cart to prevent stale data
            setCartItems([]);
            await AsyncStorage.setItem('cartItems', JSON.stringify([]));
        }
    };

    // Ensure cart data is always available
    const ensureCartData = async () => {
        try {
            // Check if we have cart data
            if (!cartItems || cartItems.length === 0) {
                console.log('No cart items in memory, checking storage...');

                // Try to load from AsyncStorage first
                const storedCartItems = await AsyncStorage.getItem('cartItems');
                if (storedCartItems) {
                    const parsedItems = JSON.parse(storedCartItems);
                    if (parsedItems && parsedItems.length > 0) {
                        console.log('Found cart items in storage, loading:', parsedItems.length, 'items');
                        setCartItems(parsedItems);
                        return;
                    }
                }

                // If still no items and user is logged in, try to refresh from server
                const token = await AsyncStorage.getItem('token');
                const storedUserId = await AsyncStorage.getItem('userId');

                if (token && storedUserId) {
                    console.log('User is logged in but no cart data found, refreshing from server');
                    await refreshCart();
                }
            }
        } catch (error) {
            console.error('Error ensuring cart data:', error);
        }
    };

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
        clearCart,
        fetchCartData,
        refreshCart,
        ensureCartData
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider; 