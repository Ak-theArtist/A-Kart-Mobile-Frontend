import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import ShopContextProvider from './src/context/ShopContext';
import ThemeProvider from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import AppRefresher from './src/components/AppRefresher';

export default function App() {
    return (
        <SafeAreaProvider>
            <StatusBar style="auto" />
            <AuthProvider>
                <ShopContextProvider>
                    <ThemeProvider>
                        <AppRefresher>
                            <AppNavigator />
                        </AppRefresher>
                    </ThemeProvider>
                </ShopContextProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
} 