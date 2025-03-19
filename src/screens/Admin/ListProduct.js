import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert, Modal } from 'react-native';
import axios from 'axios';
import { ThemeContext } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { ShopContext } from '../../context/ShopContext';
import EditProduct from './EditProduct';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import AdminHeader from '../../components/AdminHeader';

const ListProduct = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const { userRole } = useContext(ShopContext);
    const { isDarkMode } = useContext(ThemeContext);
    const navigation = useNavigation();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('https://a-kart-backend.onrender.com/product/allproducts');
            setAllProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            Alert.alert('Error', 'Failed to load products. Please try again.');
        }
    };

    const removeProduct = async (id) => {
        try {
            await axios.post('https://a-kart-backend.onrender.com/product/removeproduct', { id }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            fetchProducts();
            Alert.alert('Success', 'Product removed successfully');
        } catch (error) {
            console.error('Error removing product:', error);
            Alert.alert('Error', 'Failed to remove product');
        }
    };

    const showDeleteModal = (id) => {
        setSelectedProductId(id);
        setIsDeleteModalOpen(true);
    };

    const showEditModal = (id) => {
        setSelectedProductId(id);
        setIsEditModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        removeProduct(selectedProductId);
        setIsDeleteModalOpen(false);
    };

    const handleEditClose = () => {
        setIsEditModalOpen(false);
        fetchProducts(); // Refresh the list after edit
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }}>
            <AdminHeader title="Manage Products" />
            <ScrollView style={styles.container}>
                <View style={styles.listHeader}>
                    <Text style={[styles.columnHeader, styles.imageColumn, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Product</Text>
                    <Text style={[styles.columnHeader, styles.titleColumn, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Title</Text>
                    <Text style={[styles.columnHeader, styles.priceColumn, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Price</Text>
                    {userRole === 'admin' && (
                        <Text style={[styles.columnHeader, styles.actionColumn, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Actions</Text>
                    )}
                </View>

                <View style={styles.productList}>
                    {allProducts.map((product) => (
                        <View
                            key={product._id}
                            style={[styles.productItem, { backgroundColor: isDarkMode ? COLORS.darkGray : COLORS.white }]}
                        >
                            <TouchableOpacity
                                style={styles.imageColumn}
                                onPress={() => navigation.navigate('ProductDetails', { productId: product._id })}
                            >
                                <Image source={{ uri: product.image[0] }} style={styles.productImage} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.titleColumn}
                                onPress={() => navigation.navigate('ProductDetails', { productId: product._id })}
                            >
                                <Text style={[styles.productTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]} numberOfLines={2}>
                                    {product.name}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.priceColumn}>
                                <Text style={[styles.oldPrice, { color: isDarkMode ? COLORS.lightGray : COLORS.darkGray }]}>
                                    ₹{product.old_price}
                                </Text>
                                <Text style={[styles.newPrice, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                                    ₹{product.new_price}
                                </Text>
                            </View>

                            {userRole === 'admin' && (
                                <View style={styles.actionColumn}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                                        onPress={() => showEditModal(product._id)}
                                    >
                                        <Text style={styles.actionButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                                        onPress={() => showDeleteModal(product._id)}
                                    >
                                        <Text style={styles.actionButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={isDeleteModalOpen}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? COLORS.darkGray : COLORS.white }]}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                            Delete Product
                        </Text>
                        <Text style={[styles.modalText, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                            Are you sure you want to delete this product?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: COLORS.error }]}
                                onPress={handleDeleteConfirm}
                            >
                                <Text style={styles.modalButtonText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: COLORS.secondary }]}
                                onPress={() => setIsDeleteModalOpen(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Product Modal */}
            <Modal
                visible={isEditModalOpen}
                transparent={true}
                animationType="slide"
                statusBarTranslucent
            >
                <View style={styles.editModalOverlay}>
                    <View style={[
                        styles.editModalContainer,
                        { backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }
                    ]}>
                        <View style={styles.editModalHeader}>
                            <TouchableOpacity
                                onPress={handleEditClose}
                                style={styles.closeButton}
                            >
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color={isDarkMode ? COLORS.white : COLORS.black}
                                />
                            </TouchableOpacity>
                            <Text style={[
                                styles.editModalTitle,
                                { color: isDarkMode ? COLORS.white : COLORS.black }
                            ]}>
                                Edit Product
                            </Text>
                        </View>
                        <EditProduct productId={selectedProductId} onClose={handleEditClose} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listHeader: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    columnHeader: {
        fontSize: 16,
        fontWeight: '600',
    },
    productList: {
        padding: 20,
    },
    productItem: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    imageColumn: {
        width: '20%',
    },
    titleColumn: {
        width: '35%',
        paddingHorizontal: 10,
    },
    priceColumn: {
        width: '25%',
    },
    actionColumn: {
        width: '20%',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 5,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    oldPrice: {
        fontSize: 12,
        textDecorationLine: 'line-through',
    },
    newPrice: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionButton: {
        padding: 5,
        borderRadius: 5,
        marginBottom: 5,
        alignItems: 'center',
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 5,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    modalButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '500',
    },
    editModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    editModalContainer: {
        height: '95%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 5,
    },
    editModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    closeButton: {
        marginRight: 15,
    },
    editModalTitle: {
        fontSize: 20,
        fontWeight: '600',
        flex: 1,
    },
});

export default ListProduct; 