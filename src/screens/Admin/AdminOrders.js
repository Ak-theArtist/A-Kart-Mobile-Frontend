import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import axios from 'axios';
import { ThemeContext } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/AdminHeader';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOption, setSortOption] = useState('latest');
    const { isDarkMode, colors } = useContext(ThemeContext);
    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('https://a-kart-backend.onrender.com/order/allorders');
            setOrders(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await axios.put(`https://a-kart-backend.onrender.com/order/updateorder/${orderId}`, { status: newStatus });
            setOrders(orders.map(order => order._id === response.data.order._id ? response.data.order : order));
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const sortOrders = (orders, option) => {
        switch (option) {
            case 'highest-price':
                return [...orders].sort((a, b) => b.totalAmount - a.totalAmount);
            case 'lowest-price':
                return [...orders].sort((a, b) => a.totalAmount - b.totalAmount);
            case 'latest':
                return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'shipped':
            case 'delivered':
            case 'cancelled':
            case 'pending':
                return [...orders].filter(order => order.status === option);
            default:
                return orders;
        }
    };

    // Define sort options similar to categories in ShopScreen
    const sortOptions = [
        { id: 'latest', name: 'Latest' },
        { id: '', name: 'All Orders' },
        { id: 'pending', name: 'Pending' },
        { id: 'oldest', name: 'Oldest' },
        { id: 'highest-price', name: 'Highest Price' },
        { id: 'lowest-price', name: 'Lowest Price' },
        { id: 'shipped', name: 'Shipped' },
        { id: 'delivered', name: 'Delivered' },
        { id: 'cancelled', name: 'Cancelled' }
    ];

    const sortedOrders = sortOrders(orders, sortOption);

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }}>
            <AdminHeader title="Manage Orders" />

            <View style={[styles.categoriesWrapper, { backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {sortOptions.map(option => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.categoryButton,
                                {
                                    backgroundColor: sortOption === option.id ? COLORS.primary : isDarkMode ? 'rgba(255,255,255,0.1)' : COLORS.white,
                                    borderColor: COLORS.primary,
                                    borderWidth: sortOption === option.id ? 2 : 1.5,
                                    minWidth: width / 6,
                                    paddingHorizontal: width < 350 ? 12 : 20,
                                }
                            ]}
                            onPress={() => setSortOption(option.id)}
                        >
                            <Text style={[
                                styles.categoryText,
                                sortOption === option.id
                                    ? { color: COLORS.white }
                                    : { color: isDarkMode ? COLORS.white : COLORS.primary },
                                { fontSize: width < 350 ? 14 : 16 }
                            ]}>
                                {option.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Loading...</Text>
                </View>
            ) : (
                <ScrollView style={styles.container}>
                    <View style={styles.ordersList}>
                        {sortedOrders.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyText, { color: isDarkMode ? COLORS.white : COLORS.secondary }]}>
                                    No orders found in this category.
                                </Text>
                            </View>
                        ) : (
                            sortedOrders.map(order => (
                                <View key={order._id} style={[
                                    styles.orderItem,
                                    { backgroundColor: isDarkMode ? COLORS.darkGray : COLORS.white }
                                ]}>
                                    <View style={styles.orderHeader}>
                                        <View>
                                            <Text style={[styles.orderLabel, { color: isDarkMode ? COLORS.gray : COLORS.darkGray }]}>
                                                Order ID
                                            </Text>
                                            <Text style={[styles.orderValue, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                                                {order._id}
                                            </Text>
                                        </View>
                                        <View style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor:
                                                    order.status === 'delivered' ? COLORS.success :
                                                        order.status === 'shipped' ? COLORS.primary :
                                                            order.status === 'cancelled' ? COLORS.error :
                                                                COLORS.warning
                                            }
                                        ]}>
                                            <Text style={styles.statusText}>{order.status}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.orderDetails}>
                                        <View style={styles.detailRow}>
                                            <View style={styles.detailColumn}>
                                                <Text style={[styles.orderLabel, { color: isDarkMode ? COLORS.gray : COLORS.darkGray }]}>
                                                    Date
                                                </Text>
                                                <Text style={[styles.orderValue, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            <View style={styles.detailColumn}>
                                                <Text style={[styles.orderLabel, { color: isDarkMode ? COLORS.gray : COLORS.darkGray }]}>
                                                    Time
                                                </Text>
                                                <Text style={[styles.orderValue, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.detailRow}>
                                            <View style={styles.detailColumn}>
                                                <Text style={[styles.orderLabel, { color: isDarkMode ? COLORS.gray : COLORS.darkGray }]}>
                                                    Quantity
                                                </Text>
                                                <Text style={[styles.orderValue, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                                                    {order.items.reduce((total, item) => total + item.quantity, 0)} items
                                                </Text>
                                            </View>
                                            <View style={styles.detailColumn}>
                                                <Text style={[styles.orderLabel, { color: isDarkMode ? COLORS.gray : COLORS.darkGray }]}>
                                                    Total Amount
                                                </Text>
                                                <Text style={[styles.orderValue, styles.priceText, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                                                    ₹{order.totalAmount}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                                            onPress={() => handleStatusChange(order._id, 'shipped')}
                                        >
                                            <Text style={styles.actionButtonText}>Set Shipped</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                                            onPress={() => handleStatusChange(order._id, 'delivered')}
                                        >
                                            <Text style={styles.actionButtonText}>Set Delivered</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                                            onPress={() => handleStatusChange(order._id, 'cancelled')}
                                        >
                                            <Text style={styles.actionButtonText}>Set Cancelled</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            )}
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
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    categoriesWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoriesContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        height: 70,
        alignItems: 'center',
    },
    categoryButton: {
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryText: {
        fontWeight: 'bold',
        textShadowRadius: 0.5,
    },
    ordersList: {
        padding: 15,
    },
    orderItem: {
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        paddingBottom: 15,
    },
    orderDetails: {
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    detailColumn: {
        flex: 1,
    },
    orderLabel: {
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    orderValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    priceText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 90,
        alignItems: 'center',
    },
    statusText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 13,
        textTransform: 'capitalize',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        paddingTop: 15,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default AdminOrders; 