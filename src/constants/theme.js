// Default colors for static imports
export const COLORS = {
    primary: 'rgb(9, 64, 147)',  // Blue
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

// Typography
export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
};

import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

// Spacing
export const SIZES = {
    base: 8,
    small: 12,
    medium: 16,
    large: 20,
    extraLarge: 24,
    padding: 15,
    radius: 10,
    width,
    height,
};

export default { COLORS, FONTS, SIZES }; 