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
    error: '#ff0000',
    success: '#4CAF50',
    warning: '#FFC107',
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { getTotalCartItems } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);

    // Use colors from context or default colors if not available
    const themeColors = colors || DEFAULT_COLORS;

    const cartItemCount = getTotalCartItems ? getTotalCartItems() : 0;

    return (
        <View style={[styles.container, {
            backgroundColor: themeColors.white,
            borderTopColor: themeColors.lightGray
        }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel || options.title || route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

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

                return (
                    <TouchableOpacity
                        key={index}
                        onPress={onPress}
                        style={styles.tabButton}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={iconName}
                                size={24}
                                color={isFocused ? themeColors.primary : themeColors.gray}
                            />

                            {route.name === 'Cart' && cartItemCount > 0 && (
                                <View style={[styles.badge, { backgroundColor: themeColors.primary }]}>
                                    <Text style={[styles.badgeText, { color: themeColors.white }]}>{cartItemCount}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={[
                            styles.tabText,
                            { color: isFocused ? themeColors.primary : themeColors.gray }
                        ]}>
                            {label}
                        </Text>
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
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    iconContainer: {
        position: 'relative',
    },
    tabText: {
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -10,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default CustomTabBar; 