import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    primary: 'rgb(9, 64, 147)', // Blue
    secondary: '#f5f5f5',
    background: '#121212',
    white: '#1e1e1e',
    black: '#ffffff',
    gray: '#bbbbbb',
    lightGray: '#333333',
    error: '#ff6b6b',
    success: '#6BCB77',
    warning: '#FFD93D',
};

// Create context with default values
export const ThemeContext = createContext({
    isDarkMode: false,
    toggleDarkMode: () => { },
    colors: COLORS
});

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [colors, setColors] = useState(COLORS);

    // Load saved dark mode preference
    useEffect(() => {
        const loadDarkModePreference = async () => {
            try {
                const savedMode = await AsyncStorage.getItem('isDarkMode');
                if (savedMode !== null) {
                    const darkMode = savedMode === 'true';
                    setIsDarkMode(darkMode);
                    setColors(darkMode ? DARK_COLORS : COLORS);
                }
            } catch (error) {
                console.error('Error loading dark mode preference:', error);
            }
        };

        loadDarkModePreference();
    }, []);

    // Save dark mode preference when it changes
    useEffect(() => {
        const saveDarkModePreference = async () => {
            try {
                await AsyncStorage.setItem('isDarkMode', String(isDarkMode));
                setColors(isDarkMode ? DARK_COLORS : COLORS);
            } catch (error) {
                console.error('Error saving dark mode preference:', error);
            }
        };

        saveDarkModePreference();
    }, [isDarkMode]);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    const value = {
        isDarkMode,
        toggleDarkMode,
        colors
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider; 