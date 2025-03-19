import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/AdminHeader';

const AdminDashboard = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useContext(ThemeContext);

    const menuItems = [
        {
            title: 'Manage Products',
            icon: 'inventory',
            screen: 'ListProduct',
            description: 'View and manage all products'
        },
        {
            title: 'Add Product',
            icon: 'add-box',
            screen: 'AddProduct',
            description: 'Add new products to store'
        },
        {
            title: 'Manage Orders',
            icon: 'shopping-cart',
            screen: 'AdminOrders',
            description: 'View and manage customer orders'
        },
        {
            title: 'Manage Users',
            icon: 'people',
            screen: 'AllUsers',
            description: 'View and manage user accounts'
        }
    ];

    // Choose the appropriate logo based on dark mode
    const logoSource = isDarkMode
        ? require('../../../public/assets/logo_dark.jpg')
        : require('../../../public/assets/logo.jpg');

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }}>
            <View style={[styles.header, { backgroundColor: isDarkMode ? COLORS.black : COLORS.white }]}>
                <View style={styles.headerContent}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={logoSource}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </View>
                    <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                        Admin Dashboard
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.container}>
                <View style={styles.menuGrid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.menuItem,
                                { backgroundColor: isDarkMode ? COLORS.darkGray : COLORS.white }
                            ]}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(9, 64, 163, 0.1)' }
                            ]}>
                                <MaterialIcons
                                    name={item.icon}
                                    size={32}
                                    color={isDarkMode ? COLORS.white : COLORS.primary}
                                />
                            </View>
                            <Text style={[
                                styles.menuTitle,
                                { color: isDarkMode ? COLORS.white : COLORS.black }
                            ]}>
                                {item.title}
                            </Text>
                            <Text style={[
                                styles.menuDescription,
                                { color: isDarkMode ? COLORS.gray : COLORS.darkGray }
                            ]}>
                                {item.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
    },
    logo: {
        width: 30,
        height: 30,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuGrid: {
        padding: 15,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    menuItem: {
        width: '48%',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 6,
        textAlign: 'center',
    },
    menuDescription: {
        fontSize: 12,
        textAlign: 'center',
    },
});

export default AdminDashboard; 