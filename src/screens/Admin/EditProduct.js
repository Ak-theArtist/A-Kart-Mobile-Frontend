import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    PermissionsAndroid,
    Platform
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { ShopContext } from '../../context/ShopContext';
import { COLORS } from '../../constants/colors';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button } from 'react-native-paper';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const EditProduct = ({ productId, onClose }) => {
    const { isDarkMode } = useContext(ThemeContext);
    const { updateProduct } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        old_price: '',
        new_price: '',
        images: [null, null, null, null],
    });
    const [loading, setLoading] = useState(false);
    const [fetchingProduct, setFetchingProduct] = useState(true);

    useEffect(() => {
        if (productId) {
            fetchProductDetails();
        }
    }, [productId]);

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`https://a-kart-backend.onrender.com/product/${productId}`);
            if (response.data.success) {
                const product = response.data.product;
                const productImages = Array(4).fill(null);
                if (product.image && Array.isArray(product.image)) {
                    product.image.forEach((img, index) => {
                        if (index < 4) productImages[index] = img;
                    });
                }
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    category: product.category || '',
                    old_price: product.old_price ? product.old_price.toString() : '',
                    new_price: product.new_price ? product.new_price.toString() : '',
                    images: productImages,
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            Alert.alert('Error', 'Failed to load product details');
        } finally {
            setFetchingProduct(false);
        }
    };

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: "Storage Permission",
                        message: "App needs access to your storage to select images.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleImagePick = async (index) => {
        try {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                Alert.alert('Permission Denied', 'Please grant storage permission to select images.');
                return;
            }

            const options = {
                mediaType: 'photo',
                quality: 1,
                selectionLimit: 1,
                includeBase64: false,
            };

            const response = await launchImageLibrary(options);

            if (response.didCancel) {
                console.log('User cancelled image picker');
                return;
            }

            if (response.errorCode) {
                console.log('ImagePicker Error:', response.errorMessage);
                Alert.alert('Error', 'Failed to pick image');
                return;
            }

            if (response.assets && response.assets.length > 0) {
                try {
                    const imageFormData = new FormData();
                    imageFormData.append('image', {
                        uri: response.assets[0].uri,
                        type: response.assets[0].type || 'image/jpeg',
                        name: response.assets[0].fileName || `product_image_${index}.jpg`,
                    });

                    const uploadResponse = await axios.put(
                        `https://a-kart-backend.onrender.com/product/updateimage${index + 1}/${productId}`,
                        imageFormData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );

                    if (uploadResponse.data.success) {
                        setFormData(prev => {
                            const newImages = [...prev.images];
                            newImages[index] = response.assets[0].uri;
                            return { ...prev, images: newImages };
                        });
                        Alert.alert('Success', 'Image uploaded successfully');
                    } else {
                        throw new Error('Failed to upload image');
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    Alert.alert('Error', 'Failed to upload image. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error with image picker:', error);
            Alert.alert('Error', 'Failed to open image picker');
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.description || !formData.category || !formData.old_price || !formData.new_price) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.put(`https://a-kart-backend.onrender.com/product/editproduct/${productId}`, {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                old_price: formData.old_price,
                new_price: formData.new_price,
            });

            if (response.data.success) {
                Alert.alert('Success', 'Product updated successfully', [
                    { text: 'OK', onPress: onClose }
                ]);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            Alert.alert('Error', 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingProduct) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ color: isDarkMode ? COLORS.white : COLORS.black, marginTop: 10 }}>
                    Loading product details...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.inputField}>
                    <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Product Title</Text>
                    <TextInput
                        style={[styles.input, {
                            color: isDarkMode ? COLORS.white : COLORS.black,
                            backgroundColor: isDarkMode ? '#333333' : COLORS.white,
                            borderColor: isDarkMode ? '#444444' : COLORS.border,
                        }]}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Product Name"
                        placeholderTextColor={isDarkMode ? COLORS.gray : COLORS.darkGray}
                    />
                </View>

                <View style={styles.inputField}>
                    <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Description</Text>
                    <TextInput
                        style={[styles.input, {
                            color: isDarkMode ? COLORS.white : COLORS.black,
                            backgroundColor: isDarkMode ? '#333333' : COLORS.white,
                            borderColor: isDarkMode ? '#444444' : COLORS.border,
                            height: 100,
                            textAlignVertical: 'top'
                        }]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Product Description"
                        placeholderTextColor={isDarkMode ? COLORS.gray : COLORS.darkGray}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.priceContainer}>
                    <View style={[styles.inputField, styles.priceField]}>
                        <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Old Price</Text>
                        <TextInput
                            style={[styles.input, {
                                color: isDarkMode ? COLORS.white : COLORS.black,
                                backgroundColor: isDarkMode ? '#333333' : COLORS.white,
                                borderColor: isDarkMode ? '#444444' : COLORS.border,
                            }]}
                            value={formData.old_price}
                            onChangeText={(text) => setFormData({ ...formData, old_price: text })}
                            placeholder="0.00"
                            placeholderTextColor={isDarkMode ? COLORS.gray : COLORS.darkGray}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={[styles.inputField, styles.priceField]}>
                        <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>New Price</Text>
                        <TextInput
                            style={[styles.input, {
                                color: isDarkMode ? COLORS.white : COLORS.black,
                                backgroundColor: isDarkMode ? '#333333' : COLORS.white,
                                borderColor: isDarkMode ? '#444444' : COLORS.border,
                            }]}
                            value={formData.new_price}
                            onChangeText={(text) => setFormData({ ...formData, new_price: text })}
                            placeholder="0.00"
                            placeholderTextColor={isDarkMode ? COLORS.gray : COLORS.darkGray}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.inputField}>
                    <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Category</Text>
                    <View style={styles.categoryButtons}>
                        <TouchableOpacity
                            style={[
                                styles.categoryButton,
                                { backgroundColor: isDarkMode ? '#333333' : COLORS.lightGray },
                                formData.category === 'men' && {
                                    backgroundColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                                }
                            ]}
                            onPress={() => setFormData({ ...formData, category: 'men' })}
                        >
                            <Text style={[
                                styles.categoryText,
                                { color: isDarkMode ? COLORS.white : COLORS.black },
                                formData.category === 'men' && { color: COLORS.white }
                            ]}>
                                Men
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.categoryButton,
                                { backgroundColor: isDarkMode ? '#333333' : COLORS.lightGray },
                                formData.category === 'women' && {
                                    backgroundColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                                }
                            ]}
                            onPress={() => setFormData({ ...formData, category: 'women' })}
                        >
                            <Text style={[
                                styles.categoryText,
                                { color: isDarkMode ? COLORS.white : COLORS.black },
                                formData.category === 'women' && { color: COLORS.white }
                            ]}>
                                Women
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.categoryButton,
                                { backgroundColor: isDarkMode ? '#333333' : COLORS.lightGray },
                                formData.category === 'kids' && {
                                    backgroundColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                                }
                            ]}
                            onPress={() => setFormData({ ...formData, category: 'kids' })}
                        >
                            <Text style={[
                                styles.categoryText,
                                { color: isDarkMode ? COLORS.white : COLORS.black },
                                formData.category === 'kids' && { color: COLORS.white }
                            ]}>
                                Kids
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.imageSection}>
                    <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Product Images</Text>
                    <View style={styles.imageGrid}>
                        {formData.images.map((image, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.imageUpload}
                                onPress={() => handleImagePick(index)}
                            >
                                {image ? (
                                    <View style={styles.imageContainer}>
                                        <Image
                                            source={{ uri: image }}
                                            style={styles.uploadedImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.imageOverlay}>
                                            <MaterialIcons
                                                name="edit"
                                                size={24}
                                                color={COLORS.white}
                                            />
                                        </View>
                                    </View>
                                ) : (
                                    <View style={[
                                        styles.uploadPlaceholder,
                                        { backgroundColor: isDarkMode ? '#333333' : COLORS.lightGray }
                                    ]}>
                                        <MaterialIcons
                                            name="add-photo-alternate"
                                            size={32}
                                            color={isDarkMode ? COLORS.gray : COLORS.darkGray}
                                        />
                                        <Text style={[
                                            styles.uploadText,
                                            { color: isDarkMode ? COLORS.gray : COLORS.darkGray }
                                        ]}>
                                            Add Image
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    style={[styles.submitButton, {
                        backgroundColor: isDarkMode ? 'rgb(42, 116, 226)' : COLORS.primary
                    }]}
                    labelStyle={{ color: COLORS.white }}
                    disabled={loading}
                >
                    Update Product
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 200,
    },
    inputField: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    priceField: {
        flex: 1,
        marginRight: 8,
    },
    categoryButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    categoryButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    imageSection: {
        marginVertical: 16,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    imageUpload: {
        width: '48%',
        aspectRatio: 1,
        marginBottom: 16,
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    uploadPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    uploadText: {
        marginTop: 8,
        fontSize: 12,
    },
    submitButton: {
        marginVertical: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
});

export default EditProduct; 
