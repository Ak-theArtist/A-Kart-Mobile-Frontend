import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';

// Safe text component to prevent styling issues
const SafeText = ({ style, children }) => {
    const baseStyle = { fontSize: 16, fontWeight: 'bold' };
    return <Text style={[baseStyle, style]}>{children}</Text>;
};

// Default colors in case ThemeContext is not available
const DEFAULT_COLORS = {
    primary: 'rgb(9, 64, 147)',
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

// Safe text component to prevent styling issues
const Header = ({ title = 'A-Kart', showBack = false, showCart = true }) => {
    try {
        const navigation = useNavigation();
        const { getTotalCartItems, userRole } = useContext(ShopContext);
        const { colors, isDarkMode } = useContext(ThemeContext);

        // Use colors from context or default colors if not available
        const themeColors = colors || DEFAULT_COLORS;

        const cartItemCount = getTotalCartItems ? getTotalCartItems() : 0;

        // Don't show cart for admin users
        const isAdmin = userRole === 'admin';
        const shouldShowCart = showCart && !isAdmin;

        // Safe navigation functions with error handling
        const handleBackPress = () => {
            try {
                if (navigation && navigation.canGoBack()) {
                    navigation.goBack();
                } else if (navigation) {
                    // Fallback if can't go back
                    navigation.dispatch(
                        CommonActions.navigate({
                            name: 'HomeScreen',
                        })
                    );
                }
            } catch (error) {
                console.log('Error navigating back:', error);
            }
        };

        // Navigate to cart with proper screen name
        const navigateToCart = () => {
            try {
                // We need to navigate differently because cart is in a nested navigator
                if (navigation) {
                    navigation.navigate('Cart', { screen: 'CartScreen' });
                }
            } catch (error) {
                console.log('Error navigating to cart:', error);
            }
        };

        // Choose the appropriate logo based on dark mode
        const logoSource = isDarkMode
            ? require('../../public/assets/logo_dark.jpg')
            : require('../../public/assets/logo.jpg');

        return (
            <View style={[styles.container, {
                backgroundColor: themeColors.white,
                borderBottomColor: themeColors.lightGray,
                paddingTop: 0
            }]}>
                <View style={styles.leftContainer}>
                    {showBack && (
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBackPress}
                        >
                            <Ionicons name="arrow-back" size={24} color={themeColors.secondary} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.centerContainer}>
                    <Image
                        source={logoSource}
                        style={styles.logo}
                    />
                    <SafeText style={[styles.title, { color: themeColors.secondary }]}>
                        {title}
                    </SafeText>
                </View>

                <View style={styles.rightContainer}>
                    {shouldShowCart && (
                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={navigateToCart}
                        >
                            <Ionicons name="cart-outline" size={24} color={themeColors.secondary} />
                            {cartItemCount > 0 && (
                                <View style={[styles.badge, { backgroundColor: themeColors.primary }]}>
                                    <SafeText style={[styles.badgeText, { color: themeColors.white, fontSize: 12, fontWeight: '600' }]}>
                                        {cartItemCount}
                                    </SafeText>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    } catch (error) {
        // Fallback header in case of any error
        console.log('Error in Header component:', error);
        return (
            <View style={[styles.container, { backgroundColor: '#ffffff' }]}>
                <View style={styles.centerContainer}>
                    <SafeText style={{ fontSize: 18, fontWeight: 'bold' }}>{title}</SafeText>
                </View>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    leftContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    centerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    logo: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cartButton: {
        padding: 5,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        right: -6,
        top: -3,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default Header;