import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ShopContext } from '../context/ShopContext';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
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

const ProfileScreen = ({ navigation }) => {
    const { user, logout, isLoading } = useContext(AuthContext);
    const { cartItems } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const handleLogout = async () => {
        await logout();
    };

    return (
        <View style={[styles.container, { backgroundColor: COLORS.background }]}>
            <Header title="Profile" showBack={false} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={[styles.profileHeader, {
                    backgroundColor: COLORS.white,
                    borderBottomColor: COLORS.lightGray
                }]}>
                    <View style={[styles.profileIcon, { backgroundColor: COLORS.primary }]}>
                        <Ionicons name="person" size={50} color={COLORS.white} />
                    </View>
                    <Text style={[styles.userName, { color: COLORS.secondary }]}>
                        {user?.name || 'User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: COLORS.gray }]}>
                        {user?.email || 'user@example.com'}
                    </Text>
                </View>

                <View style={[styles.statsContainer, { backgroundColor: COLORS.white }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: COLORS.primary }]}>
                            {cartItems.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: COLORS.gray }]}>
                            Cart Items
                        </Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: COLORS.lightGray }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: COLORS.primary }]}>
                            {user?.orders?.length || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: COLORS.gray }]}>
                            Orders
                        </Text>
                    </View>
                </View>

                <View style={[styles.menuContainer, { backgroundColor: COLORS.white }]}>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: COLORS.lightGray }]}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Ionicons name="person-outline" size={24} color={COLORS.secondary} />
                        <Text style={[styles.menuItemText, { color: COLORS.secondary }]}>Edit Profile</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: COLORS.lightGray }]}
                        onPress={() => navigation.navigate('ManageAddress')}
                    >
                        <Ionicons name="location-outline" size={24} color={COLORS.secondary} />
                        <Text style={[styles.menuItemText, { color: COLORS.secondary }]}>Manage Addresses</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: COLORS.lightGray }]}
                        onPress={() => navigation.navigate('MyOrders')}
                    >
                        <Ionicons name="cart-outline" size={24} color={COLORS.secondary} />
                        <Text style={[styles.menuItemText, { color: COLORS.secondary }]}>My Orders</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: COLORS.lightGray }]}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Ionicons name="settings-outline" size={24} color={COLORS.secondary} />
                        <Text style={[styles.menuItemText, { color: COLORS.secondary }]}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: COLORS.primary }]}
                        onPress={handleLogout}
                    >
                        <Text style={[styles.logoutText, { color: COLORS.white }]}>LOGOUT</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    profileHeader: {
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    profileIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        marginTop: 15,
        marginBottom: 15,
        paddingVertical: 15,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
    },
    menuContainer: {
        borderRadius: 10,
        marginHorizontal: 15,
        paddingVertical: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 15,
    },
    logoutButton: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 20,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen; 