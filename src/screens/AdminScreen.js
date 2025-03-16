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
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const AdminScreen = ({ navigation }) => {
    const { user, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // Check if user is admin
    if (!user || user.role !== 'admin') {
        return (
            <View style={styles.container}>
                <Header title="Admin" showBack={true} />
                <View style={styles.notAdminContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color={COLORS.primary} />
                    <Text style={styles.notAdminText}>You don't have admin privileges</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.backButtonText}>Go to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="Admin Dashboard" showBack={false} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>Welcome, Admin!</Text>
                    <Text style={styles.welcomeSubtext}>Manage your store from here</Text>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIcon, { backgroundColor: '#4CAF50' }]}>
                            <Ionicons name="cube-outline" size={24} color="#fff" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Products</Text>
                            <Text style={styles.menuSubtitle}>Add, edit or remove products</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIcon, { backgroundColor: '#2196F3' }]}>
                            <Ionicons name="people-outline" size={24} color="#fff" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Users</Text>
                            <Text style={styles.menuSubtitle}>Manage user accounts</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIcon, { backgroundColor: '#FF9800' }]}>
                            <Ionicons name="cart-outline" size={24} color="#fff" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Orders</Text>
                            <Text style={styles.menuSubtitle}>View and manage orders</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIcon, { backgroundColor: '#9C27B0' }]}>
                            <Ionicons name="stats-chart-outline" size={24} color="#fff" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Analytics</Text>
                            <Text style={styles.menuSubtitle}>View store statistics</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIcon, { backgroundColor: '#F44336' }]}>
                            <Ionicons name="settings-outline" size={24} color="#fff" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Settings</Text>
                            <Text style={styles.menuSubtitle}>Configure store settings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notAdminContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    notAdminText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
        color: '#555',
    },
    backButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    backButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    welcomeContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 15,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    welcomeSubtext: {
        fontSize: 16,
        color: '#666',
    },
    menuContainer: {
        backgroundColor: '#fff',
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
        borderBottomColor: '#f0f0f0',
    },
    menuIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    adminButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
});

export default AdminScreen; 