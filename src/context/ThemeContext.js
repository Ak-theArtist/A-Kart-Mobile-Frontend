import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Appearance } from 'react-native';

// Fix for React Navigation's HeaderTitle component
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// Fixed colors for light and dark modes
export const COLORS = {
    primary: 'rgb(9, 64, 147)', // Blue
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

export const DARK_COLORS = {
    primary: 'rgb(42, 116, 226)', // Brighter blue for better contrast with dark backgrounds
    primaryAlt: 'rgb(80, 150, 255)', // Even brighter blue for special elements
    secondary: '#f5f5f5',
    background: '#121212',
    white: '#1e1e1e',
    cardBackground: '#242424', // Slightly lighter than white for card backgrounds
    black: '#ffffff',
    gray: '#bbbbbb',
    lightGray: '#333333',
    error: '#ff6b6b',
    success: '#6BCB77',
    warning: '#FFD93D',
};

// Fix React Navigation's default themes to prevent the HeaderTitle error
DefaultTheme.colors.background = COLORS.background;
DefaultTheme.colors.card = COLORS.white;
DefaultTheme.colors.text = COLORS.secondary;
DefaultTheme.colors.border = COLORS.lightGray;

DarkTheme.colors.background = DARK_COLORS.background;
DarkTheme.colors.card = DARK_COLORS.white;
DarkTheme.colors.text = DARK_COLORS.secondary;
DarkTheme.colors.border = DARK_COLORS.lightGray;

// Create context with default values
export const ThemeContext = createContext({
    isDarkMode: false,
    toggleDarkMode: () => { },
    resetTheme: () => { },
    colors: COLORS
});

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [colors, setColors] = useState(COLORS);

    // Load saved theme preference
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('theme_preference');
                if (savedTheme !== null) {
                    const themeMode = savedTheme === 'dark';
                    setIsDarkMode(themeMode);
                    setColors(themeMode ? DARK_COLORS : COLORS);
                    return;
                }

                // If no saved preference, use system preference
                const colorScheme = Appearance.getColorScheme();
                const systemDarkMode = colorScheme === 'dark';
                setIsDarkMode(systemDarkMode);
                setColors(systemDarkMode ? DARK_COLORS : COLORS);

            } catch (error) {
                console.error('Error loading theme preference:', error);
            }
        };

        loadThemePreference();

        // Listen for system theme changes
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            // Only update if user hasn't set a preference
            AsyncStorage.getItem('theme_preference').then(savedTheme => {
                if (savedTheme === null) {
                    const systemDarkMode = colorScheme === 'dark';
                    setIsDarkMode(systemDarkMode);
                    setColors(systemDarkMode ? DARK_COLORS : COLORS);
                }
            });
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Save theme preference when it changes
    useEffect(() => {
        const saveThemePreference = async () => {
            try {
                await AsyncStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light');
                setColors(isDarkMode ? DARK_COLORS : COLORS);
            } catch (error) {
                console.error('Error saving theme preference:', error);
            }
        };

        saveThemePreference();
    }, [isDarkMode]);

    // Toggle dark mode
    const toggleDarkMode = async () => {
        try {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            setColors(newMode ? DARK_COLORS : COLORS);
            await AsyncStorage.setItem('theme_preference', newMode ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    // Reset to light theme
    const resetTheme = () => {
        setIsDarkMode(false);
    };

    const value = {
        isDarkMode,
        toggleDarkMode,
        resetTheme,
        colors
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider; 