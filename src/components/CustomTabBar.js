import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';

// Default colors in case ThemeContext is not available
const DEFAULT_COLORS = {
    primary: 'rgb(9, 64, 147)',
    secondary: '#333333',
    background: '#f8f8f8',
    white: '#ffffff',
    black: '#000000',
    gray: '#888888',
    lightGray: '#eeeeee',
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { getTotalCartItems } = useContext(ShopContext);
    const { colors, isDarkMode } = useContext(ThemeContext);

    // Use colors from context or default colors if not available
    const themeColors = colors || DEFAULT_COLORS;

    const cartItemCount = getTotalCartItems ? getTotalCartItems() : 0;

    const onPress = (route, isFocused) => {
        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            // If using a "Cart" tab, ensure we use proper navigation
            if (route.name === 'Cart') {
                navigation.navigate('Cart', { screen: 'CartScreen' });
            } else {
                navigation.navigate(route.name);
            }
        }
    };

    return (
        <View style={[styles.container, {
            backgroundColor: isDarkMode ? '#000000' : themeColors.white,
            borderTopColor: isDarkMode ? '#333333' : themeColors.lightGray
        }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel || options.title || route.name;

                const isFocused = state.index === index;

                let iconName;
                if (route.name === 'Home') {
                    iconName = isFocused ? 'home' : 'home-outline';
                } else if (route.name === 'Shop') {
                    iconName = isFocused ? 'grid' : 'grid-outline';
                } else if (route.name === 'Cart') {
                    iconName = isFocused ? 'cart' : 'cart-outline';
                } else if (route.name === 'Profile') {
                    iconName = isFocused ? 'person' : 'person-outline';
                } else if (route.name === 'Admin') {
                    iconName = isFocused ? 'settings' : 'settings-outline';
                }

                const color = isFocused ? themeColors.primary : isDarkMode ? '#bbbbbb' : themeColors.gray;

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={() => onPress(route, isFocused)}
                        style={styles.tabButton}
                    >
                        <View style={styles.tabContent}>
                            <Ionicons name={iconName} size={24} color={color} />
                            {route.name === 'Cart' && cartItemCount > 0 && (
                                <View style={[styles.badge, { backgroundColor: themeColors.primary }]}>
                                    <Text style={styles.badgeText}>{cartItemCount}</Text>
                                </View>
                            )}
                            <Text style={[styles.label, { color, fontFamily: 'System' }]}>
                                {label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 5,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContent: {
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        right: -6,
        top: -3,
        backgroundColor: 'red',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    label: {
        fontSize: 12,
        marginTop: 4,
    },
});

export default CustomTabBar; 