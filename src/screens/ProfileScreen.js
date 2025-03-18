import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    useWindowDimensions,
    Platform,
    Image
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ShopContext } from '../context/ShopContext';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AvatarSelectionModal from '../components/AvatarSelectionModal';

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
    const { colors, isDarkMode } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    // Load saved avatar
    useEffect(() => {
        const loadAvatar = async () => {
            try {
                const savedAvatar = await AsyncStorage.getItem('userAvatar');
                if (savedAvatar) {
                    const parsedAvatar = JSON.parse(savedAvatar);
                    setSelectedAvatar(parsedAvatar);
                }
            } catch (error) {
                console.error('Error loading avatar:', error);
            }
        };

        loadAvatar();
    }, []);

    // Save avatar when it changes
    useEffect(() => {
        const saveAvatar = async () => {
            if (selectedAvatar) {
                try {
                    await AsyncStorage.setItem('userAvatar', JSON.stringify(selectedAvatar));

                    // Show tooltip briefly
                    setShowTooltip(true);
                    setTimeout(() => {
                        setShowTooltip(false);
                    }, 3000);
                } catch (error) {
                    console.error('Error saving avatar:', error);
                }
            }
        };

        saveAvatar();
    }, [selectedAvatar]);

    // Adjust sizes based on screen width
    const iconSize = width < 350 ? 22 : 24;
    const fontSize = {
        userName: width < 350 ? 20 : 22,
        userEmail: width < 350 ? 14 : 16,
        statValue: width < 350 ? 18 : 20,
        menuItem: width < 350 ? 14 : 16
    };
    const padding = {
        menuItem: width < 350 ? 12 : 15,
        container: width < 350 ? 10 : 15
    };

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

    const handleAvatarSelect = (avatar) => {
        setSelectedAvatar(avatar);
    };

    return (
        <View style={[styles.container, { backgroundColor: COLORS.background }]}>
            <Header title="Profile" showBack={false} />

            <ScrollView
                contentContainerStyle={[styles.scrollContainer, { paddingHorizontal: padding.container }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.profileHeader, {
                    backgroundColor: COLORS.white,
                    borderBottomColor: COLORS.lightGray
                }]}>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={() => setModalVisible(true)}
                    >
                        {selectedAvatar && selectedAvatar.source ? (
                            <Image
                                source={selectedAvatar.source}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <View style={[styles.profileIcon, { backgroundColor: COLORS.primary }]}>
                                <Ionicons name="person" size={width < 350 ? 40 : 50} color={COLORS.white} />
                            </View>
                        )}
                        <View style={[styles.editBadge, { backgroundColor: COLORS.primary }]}>
                            <Ionicons name="pencil" size={12} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>

                    {showTooltip && (
                        <View style={[styles.tooltip, { backgroundColor: COLORS.secondary }]}>
                            <Text style={[styles.tooltipText, { color: COLORS.white }]}>
                                Avatar will reset on logout
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.userName, {
                        color: COLORS.secondary,
                        fontSize: fontSize.userName
                    }]}>
                        {user?.name || 'User'}
                    </Text>
                    <Text style={[styles.userEmail, {
                        color: COLORS.gray,
                        fontSize: fontSize.userEmail
                    }]}>
                        {user?.email || 'user@example.com'}
                    </Text>
                </View>

                <View style={[styles.statsContainer, { backgroundColor: COLORS.white }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, {
                            color: COLORS.primary,
                            fontSize: fontSize.statValue
                        }]}>
                            {cartItems.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: COLORS.gray }]}>
                            Cart Items
                        </Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: COLORS.lightGray }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, {
                            color: COLORS.primary,
                            fontSize: fontSize.statValue
                        }]}>
                            {user?.orders?.length || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: COLORS.gray }]}>
                            Orders
                        </Text>
                    </View>
                </View>

                <View style={[styles.menuContainer, {
                    backgroundColor: COLORS.white,
                    borderRadius: width < 350 ? 8 : 10
                }]}>
                    <TouchableOpacity
                        style={[styles.menuItem, {
                            borderBottomColor: COLORS.lightGray,
                            paddingVertical: padding.menuItem
                        }]}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Ionicons name="person-outline" size={iconSize} color={COLORS.secondary} />
                        <Text style={[styles.menuItemText, {
                            color: COLORS.secondary,
                            fontSize: fontSize.menuItem
                        }]}>Edit Profile</Text>
                        <Ionicons name="chevron-forward" size={iconSize - 4} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, {
                            borderBottomColor: COLORS.lightGray,
                            paddingVertical: padding.menuItem
                        }]}
                        onPress={() => navigation.navigate('ManageAddress')}
                    >
                        <Ionicons name="location-outline" size={iconSize} color={COLORS.secondary} />
                        <Text style={[styles.menuItemText, {
                            color: COLORS.secondary,
                            fontSize: fontSize.menuItem
                        }]}>Manage Addresses</Text>
                        <Ionicons name="chevron-forward" size={iconSize - 4} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, {
                            borderBottomColor: COLORS.lightGray,
                            paddingVertical: padding.menuItem
                        }]}
                        onPress={() => navigation.navigate('MyOrders')}
                    >
                        <Ionicons name="cart-outline" size={iconSize} color={COLORS.secondary} />
                        <Text style={[styles.menuItemText, {
                            color: COLORS.secondary,
                            fontSize: fontSize.menuItem
                        }]}>My Orders</Text>
                        <Ionicons name="chevron-forward" size={iconSize - 4} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, {
                            borderBottomColor: COLORS.lightGray,
                            paddingVertical: padding.menuItem
                        }]}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Ionicons name="settings-outline" size={iconSize} color={COLORS.secondary} />
                        <Text style={[styles.menuItemText, {
                            color: COLORS.secondary,
                            fontSize: fontSize.menuItem
                        }]}>Settings</Text>
                        <Ionicons name="chevron-forward" size={iconSize - 4} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.logoutButton, {
                            backgroundColor: COLORS.primary,
                            marginTop: width < 350 ? 15 : 20,
                            marginHorizontal: width < 350 ? 15 : 20,
                            paddingVertical: width < 350 ? 12 : 15
                        }]}
                        onPress={handleLogout}
                    >
                        <Text style={[styles.logoutText, { color: COLORS.white }]}>LOGOUT</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <AvatarSelectionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelectAvatar={handleAvatarSelect}
                colors={COLORS}
            />
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    tooltip: {
        padding: 8,
        borderRadius: 5,
        marginBottom: 10,
    },
    tooltipText: {
        fontSize: 12,
    },
    userName: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userEmail: {
        marginBottom: 5,
    },
    statsContainer: {
        flexDirection: 'row',
        marginTop: 15,
        marginBottom: 15,
        paddingVertical: 15,
        borderRadius: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    statItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
    },
    statDivider: {
        width: 1,
        height: '70%',
        alignSelf: 'center',
    },
    menuContainer: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    menuItemText: {
        flex: 1,
        marginLeft: 15,
    },
    logoutButton: {
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ProfileScreen; 