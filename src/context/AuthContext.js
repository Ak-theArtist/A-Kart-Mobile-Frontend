import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import axios from 'axios';
import { Buffer } from 'buffer';

// Helper function to decode JWT token payload
const decodeJWT = (token) => {
    try {
        const payloadBase64 = token.split('.')[1];
        const normalizedPayload = payloadBase64
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const payloadBuffer = Buffer.from(normalizedPayload, 'base64');
        const payloadString = payloadBuffer.toString('utf8');
        return JSON.parse(payloadString);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return {};
    }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const checkUserLoggedIn = async () => {
            setIsLoading(true);
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    console.log('Checking user login with token:', token.substring(0, 10) + '...');

                    // Configure token in axios
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    try {
                        const response = await api.get('/auth/me', {
                            withCredentials: true
                        });

                        // Store token in user object for easy access
                        setUser({
                            ...response.data,
                            token: token
                        });
                    } catch (apiError) {
                        console.error('API error checking user login:', apiError);

                        // If we get a 401 Unauthorized, the token might be expired or invalid
                        // But we'll keep the token and not log the user out
                        if (apiError.response && apiError.response.status === 401) {
                            console.log('Token might be expired, but keeping user logged in');

                            // Try to create a minimal user object from the token
                            try {
                                // Parse the JWT token to get basic user info
                                const tokenData = decodeJWT(token);

                                setUser({
                                    _id: tokenData.id || tokenData.sub,
                                    email: tokenData.email,
                                    name: tokenData.name || 'User',
                                    token: token
                                });
                            } catch (tokenError) {
                                console.error('Error parsing token:', tokenError);
                                // Even if parsing fails, keep a minimal user object
                                setUser({
                                    token: token,
                                    name: 'User'
                                });
                            }
                        } else {
                            // For other errors, log out
                            await AsyncStorage.removeItem('token');
                            setUser(null);
                        }
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking user login status:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            // CRITICAL: Reset all state and storage before login
            console.log('Completely resetting app state before login');

            // Clear user state
            setUser(null);

            // Reset API client
            delete api.defaults.headers.common['Authorization'];

            // Clear ALL local data
            const keys = ['token', 'userId', 'cartItems', 'userAvatar', 'isDarkMode'];
            for (const key of keys) {
                await AsyncStorage.removeItem(key);
            }

            console.log('All local storage cleared for fresh login');
            console.log(`Attempting login for: ${email}`);

            // Make the login request
            const response = await api.post('/auth/login', {
                email,
                password
            });

            console.log('Login response:', response.data);

            if (response.data && response.data.token) {
                // Store token
                const token = response.data.token;
                await AsyncStorage.setItem('token', token);
                console.log('Token stored successfully');

                try {
                    // Set new auth header
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Get user data
                    const userResponse = await api.get('/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    console.log('User data fetched successfully:', userResponse.data.name);

                    // Save user ID
                    if (userResponse.data && userResponse.data._id) {
                        await AsyncStorage.setItem('userId', userResponse.data._id);
                        console.log('User ID stored in AsyncStorage:', userResponse.data._id);
                    }

                    // Store user in state
                    setUser({
                        ...userResponse.data,
                        token: token
                    });

                    // Explicitly fetch the cart for this user
                    try {
                        console.log(`Fetching cart data for user ${userResponse.data._id} after login`);
                        const cartResponse = await api.get(`/auth/cart/${userResponse.data._id}`);

                        if (cartResponse.data && cartResponse.data.cart) {
                            console.log('Cart data after login:', cartResponse.data.cart);
                            // Save cart data to AsyncStorage
                            await AsyncStorage.setItem('cartItems', JSON.stringify(cartResponse.data.cart));

                            // Important: Make sure the cart is available in memory immediately
                            // This ensures the cart is visible without waiting for the next render cycle
                            if (global.shopContextRef && global.shopContextRef.current) {
                                console.log('Directly updating ShopContext cart data');
                                global.shopContextRef.current.setCartItems(cartResponse.data.cart);
                            }
                        } else {
                            console.log('No cart data found for user, initializing empty cart');
                            await AsyncStorage.setItem('cartItems', JSON.stringify([]));
                        }
                    } catch (cartError) {
                        console.error('Error fetching cart after login:', cartError);
                        await AsyncStorage.setItem('cartItems', JSON.stringify([]));
                    }

                    // Trigger app refresh to reload all components
                    console.log('Login successful - triggering app refresh');
                    await AsyncStorage.setItem('triggerAppRefresh', 'true');

                } catch (userError) {
                    console.error('Error fetching user data:', userError);

                    // Even if we can't get user data, we have a token, so consider login successful
                    // but with limited functionality
                    setError('Login successful but failed to fetch user data. Some features may be limited.');

                    // Create a minimal user object with token
                    setUser({
                        email: email,
                        name: 'User',
                        role: 'user',
                        token: token
                    });
                }
            } else if (response.data && response.data.user) {
                // Some APIs return user data directly
                console.log('Login successful, user data received directly');

                // If there's a token in the response but not at the top level
                if (response.data.user.token) {
                    const token = response.data.user.token;
                    await AsyncStorage.setItem('token', token);

                    // Store token in user object for easy access
                    setUser({
                        ...response.data.user,
                        token: token
                    });
                } else {
                    setUser(response.data.user);
                }
            } else {
                console.error('No token or user data in response:', response.data);
                setError('Invalid credentials - unexpected response format');
            }
        } catch (error) {
            console.error('Login error:', error);

            if (error.response) {
                console.error('Error response status:', error.response.status);
                console.error('Error response data:', error.response.data);

                // Handle specific error cases
                if (error.response.status === 401) {
                    setError('Invalid email or password. Please try again.');
                } else if (error.response.status === 404) {
                    setError('User not found. Please check your email or register.');
                } else if (error.response.data && error.response.data.message) {
                    setError(error.response.data.message);
                } else {
                    setError('Login failed. Please try again later.');
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                setError('Network error. Please check your connection and try again.');
            } else {
                // Something happened in setting up the request
                console.error('Request setup error:', error.message);
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Attempting registration with:', { email, name, password });
            console.log('Using endpoint: /auth/register');

            // Use the correct register endpoint
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                // Add any other required fields
                role: 'user'
            });

            console.log('Registration response:', response.data);

            if (response.data && response.data.token) {
                // Don't store token or set user after registration
                // Just return success so the component can navigate to login
                console.log('Registration successful, returning to component');
                return { success: true };
            } else if (response.data && response.data.success) {
                // Some APIs don't return a token directly
                console.log('Registration successful, returning to component');
                return { success: true };
            } else {
                console.error('No token or success in response:', response.data);
                setError('Registration failed - unexpected response format');
            }
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response) {
                console.error('Error response status:', error.response.status);
                console.error('Error response data:', error.response.data);
                console.error('Error response headers:', error.response.headers);
                console.error('Error request URL:', error.config.url);
                console.error('Error request data:', error.config.data);

                // Handle specific error cases
                if (error.response.status === 409) {
                    setError('Email already exists. Please use a different email.');
                } else if (error.response.data.message) {
                    setError(error.response.data.message);
                } else {
                    setError(`Registration failed (${error.response.status}). Please try again.`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                setError('Network error. Please check your connection and try again.');
            } else {
                // Something happened in setting up the request
                console.error('Error message:', error.message);
                setError(`An unexpected error occurred: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            // Get the current user info for logging
            const currentUserId = user?._id || await AsyncStorage.getItem('userId');
            const currentUserName = user?.name || 'unknown';
            console.log(`Logging out user: ${currentUserName} (${currentUserId})`);

            // Step 1: Call the backend logout endpoint
            try {
                await api.get('/auth/logout');
                console.log('Backend logout successful');
            } catch (logoutError) {
                console.error('Backend logout failed:', logoutError);
                // Continue with local logout even if backend fails
            }

            // Step 2: Clear all auth headers
            delete api.defaults.headers.common['Authorization'];

            // Step 3: Clear ALL local storage data
            const keys = [
                'token',
                'userId',
                'cartItems',
                'userAvatar',
                'isDarkMode',
                // Add any other keys that might be used
            ];

            for (const key of keys) {
                await AsyncStorage.removeItem(key);
                console.log(`Cleared ${key} from AsyncStorage`);
            }

            // Step 4: Reset all state
            setUser(null);

            console.log('Logout completed successfully - all data cleared');
        } catch (error) {
            console.error('Logout error:', error);

            // Force cleanup even on error
            try {
                delete api.defaults.headers.common['Authorization'];
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('userId');
                await AsyncStorage.removeItem('cartItems');
                await AsyncStorage.removeItem('userAvatar');
                setUser(null);
                console.log('Forced cleanup completed after logout error');
            } catch (cleanupError) {
                console.error('Even cleanup failed:', cleanupError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (userData) => {
        setIsLoading(true);
        try {
            const token = user.token || await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token is missing');
            }

            const response = await axios.put(
                'https://a-kart-backend.onrender.com/auth/updateProfile',
                { ...userData, userId: user._id },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            // Update the user state with the new data
            setUser(prev => ({
                ...prev,
                ...response.data,
                token: token // Preserve the token
            }));

            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw new Error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                error,
                login,
                register,
                logout,
                setUser,
                updateProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}; 