import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use direct URL instead of environment variable
const API_URL = 'https://a-kart-backend.onrender.com';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 30000, // Increase timeout to 30 seconds since render.com free tier can be slow
});

// Add request interceptor to add the token to requests
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('Adding token to request:', token.substring(0, 10) + '...');
            }
            console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
            return config;
        } catch (error) {
            console.error('Request interceptor error:', error);
            return config;
        }
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        console.error('API Error:', error);

        // Handle 401 Unauthorized errors - session expired or invalid token
        if (error.response && error.response.status === 401) {
            console.log('Unauthorized request detected - clearing session data');

            try {
                // Clear all user session data
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('userId');
                await AsyncStorage.removeItem('cartItems');

                // Clear authorization header
                delete api.defaults.headers.common['Authorization'];

                console.log('Session data cleared due to unauthorized request');

                // Optionally, you could trigger a navigation to login screen here
                // or emit an event that the app can listen for
            } catch (storageError) {
                console.error('Error clearing session after 401:', storageError);
            }
        }

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Request setup error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api; 