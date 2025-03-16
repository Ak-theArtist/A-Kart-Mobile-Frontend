import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const checkUserLoggedIn = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    console.log('Checking user login with token:', token.substring(0, 10) + '...');

                    const response = await api.get('/auth/me', {
                        withCredentials: true
                    });

                    // Store token in user object for easy access
                    setUser({
                        ...response.data,
                        token: token
                    });
                }
            } catch (error) {
                console.error('Error checking user login status:', error);
                await AsyncStorage.removeItem('token');
                setUser(null);
            }
        };

        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Attempting login with:', { email });

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
                    // Get user data
                    const userResponse = await api.get('/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        withCredentials: true
                    });

                    console.log('User data:', userResponse.data);

                    // Store token in user object for easy access
                    setUser({
                        ...userResponse.data,
                        token: token
                    });
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
            await api.get('/auth/logout');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('cartItems');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            // Even if the logout API fails, clear local storage and user state
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('cartItems');
            setUser(null);
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