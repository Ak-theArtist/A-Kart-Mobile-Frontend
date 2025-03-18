import React, { useEffect, useState, useContext } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShopContext } from '../context/ShopContext';

const AppRefresher = ({ children }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshCount, setRefreshCount] = useState(0);
    const { refreshCart } = useContext(ShopContext);

    useEffect(() => {
        const checkForRefreshTrigger = async () => {
            try {
                const shouldRefresh = await AsyncStorage.getItem('triggerAppRefresh');

                if (shouldRefresh === 'true') {
                    console.log('App refresh triggered');
                    setIsRefreshing(true);

                    // Clear the refresh flag
                    await AsyncStorage.removeItem('triggerAppRefresh');

                    // Refresh cart data as part of the app refresh
                    try {
                        console.log('Refreshing cart data during app refresh');
                        await refreshCart();
                    } catch (cartError) {
                        console.error('Error refreshing cart during app refresh:', cartError);
                    }

                    // Wait a moment to allow the UI to show the refreshing state
                    setTimeout(() => {
                        // Increment refresh count to force a re-render of all children
                        setRefreshCount(prev => prev + 1);
                        setIsRefreshing(false);
                        console.log('App refresh completed');
                    }, 1000);
                }
            } catch (error) {
                console.error('Error checking refresh flag:', error);
            }
        };

        checkForRefreshTrigger();
    }, [refreshCart]);

    if (isRefreshing) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#094093" />
                <Text style={styles.text}>Loading items...</Text>
            </View>
        );
    }

    // Use refreshCount as a key to force complete re-rendering of all children
    return (
        <React.Fragment key={`app-refresh-${refreshCount}`}>
            {children}
        </React.Fragment>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
});

export default AppRefresher; 