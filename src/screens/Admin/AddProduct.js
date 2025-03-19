import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { ThemeContext } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';
import { Button } from 'react-native-paper';
import { ShopContext } from '../../context/ShopContext';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/AdminHeader';

const AddProduct = () => {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productImages, setProductImages] = useState([null, null, null, null]);
    const [category, setCategory] = useState('');
    const [old_price, setOld_price] = useState('');
    const [new_price, setNew_price] = useState('');
    const [message, setMessage] = useState('');
    const { isDarkMode } = useContext(ThemeContext);
    const navigation = useNavigation();

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

    const pickImage = async (index) => {
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
                const newImages = [...productImages];
                newImages[index] = {
                    uri: response.assets[0].uri,
                    type: response.assets[0].type || 'image/jpeg',
                    name: response.assets[0].fileName || `product_image_${index}.jpg`
                };
                setProductImages(newImages);
            }
        } catch (error) {
            console.error('Error with image picker:', error);
            Alert.alert('Error', 'Failed to open image picker');
        }
    };

    const handleSubmit = async () => {
        if (!productName || !productDescription || !category || !old_price || !new_price || productImages.some(img => !img)) {
            setMessage('All fields are required!');
            return;
        }

        const formData = new FormData();
        formData.append('name', productName);
        formData.append('description', productDescription);
        formData.append('category', category);
        formData.append('old_price', old_price);
        formData.append('new_price', new_price);

        productImages.forEach((image, index) => {
            if (image) {
                const imageUri = image.uri;
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image';

                formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type
                });
            }
        });

        try {
            const response = await axios.post('https://a-kart-backend.onrender.com/product/addproduct', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setMessage('Product added successfully!');
                setProductName('');
                setProductDescription('');
                setCategory('');
                setOld_price('');
                setNew_price('');
                setProductImages([null, null, null, null]);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            setMessage('Error adding product. Please try again.');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }}>
            <AdminHeader title="Add New Product" />
            <ScrollView>
                <View style={styles.addProduct}>
                    <View style={styles.inputField}>
                        <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Product Title</Text>
                        <TextInput
                            style={[styles.input, { color: isDarkMode ? COLORS.white : COLORS.black }]}
                            value={productName}
                            onChangeText={setProductName}
                            placeholder="Type Here"
                            placeholderTextColor={isDarkMode ? COLORS.gray : COLORS.darkGray}
                        />
                    </View>

                    <View style={styles.inputField}>
                        <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Product Description</Text>
                        <TextInput
                            style={[styles.input, { color: isDarkMode ? COLORS.white : COLORS.black }]}
                            value={productDescription}
                            onChangeText={setProductDescription}
                            placeholder="Type Here"
                            placeholderTextColor={isDarkMode ? COLORS.gray : COLORS.darkGray}
                            multiline
                        />
                    </View>

                    <View style={styles.priceContainer}>
                        <View style={[styles.inputField, styles.priceField]}>
                            <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Old Price</Text>
                            <TextInput
                                style={[styles.input, { color: isDarkMode ? COLORS.white : COLORS.black }]}
                                value={old_price}
                                onChangeText={setOld_price}
                                placeholder="Type Here"
                                placeholderTextColor={isDarkMode ? COLORS.gray : COLORS.darkGray}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={[styles.inputField, styles.priceField]}>
                            <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Offer Price</Text>
                            <TextInput
                                style={[styles.input, { color: isDarkMode ? COLORS.white : COLORS.black }]}
                                value={new_price}
                                onChangeText={setNew_price}
                                placeholder="Type Here"
                                placeholderTextColor={isDarkMode ? COLORS.gray : COLORS.darkGray}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.inputField}>
                        <Text style={[styles.label, { color: isDarkMode ? COLORS.white : COLORS.black }]}>Category</Text>
                        <TouchableOpacity
                            style={[styles.categoryButton, { backgroundColor: isDarkMode ? COLORS.darkGray : COLORS.lightGray }]}
                            onPress={() => setCategory('men')}
                        >
                            <Text style={[styles.categoryText, { color: category === 'men' ? COLORS.primary : isDarkMode ? COLORS.white : COLORS.black }]}>Men</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryButton, { backgroundColor: isDarkMode ? COLORS.darkGray : COLORS.lightGray }]}
                            onPress={() => setCategory('women')}
                        >
                            <Text style={[styles.categoryText, { color: category === 'women' ? COLORS.primary : isDarkMode ? COLORS.white : COLORS.black }]}>Women</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryButton, { backgroundColor: isDarkMode ? COLORS.darkGray : COLORS.lightGray }]}
                            onPress={() => setCategory('kid')}
                        >
                            <Text style={[styles.categoryText, { color: category === 'kid' ? COLORS.primary : isDarkMode ? COLORS.white : COLORS.black }]}>Kids</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageUploadContainer}>
                        {productImages.map((image, index) => (
                            <TouchableOpacity key={index} style={styles.imageUpload} onPress={() => pickImage(index)}>
                                {image ? (
                                    <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
                                ) : (
                                    <View style={[styles.uploadPlaceholder, { backgroundColor: isDarkMode ? COLORS.darkGray : COLORS.lightGray }]}>
                                        <Text style={[styles.uploadText, { color: isDarkMode ? COLORS.white : COLORS.black }]}>+</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
                        <Text style={styles.addButtonText}>ADD PRODUCT</Text>
                    </TouchableOpacity>

                    {message ? (
                        <Text style={[styles.message, { color: message.includes('Error') ? COLORS.error : COLORS.success }]}>
                            {message}
                        </Text>
                    ) : null}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    addProduct: {
        padding: 20,
    },
    inputField: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priceField: {
        flex: 1,
        marginRight: 10,
    },
    categoryButton: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    categoryText: {
        fontSize: 16,
        textAlign: 'center',
    },
    imageUploadContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    imageUpload: {
        width: '48%',
        aspectRatio: 1,
        marginBottom: 10,
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    uploadPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        fontSize: 30,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    message: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
    },
});

export default AddProduct; 