import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import { SIZES } from '../constants/theme';
import axios from 'axios';

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

const ManageAddressScreen = ({ navigation }) => {
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const { colors } = useContext(ThemeContext);

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    const [addresses, setAddresses] = useState([]);
    const [pincodes, setPincodes] = useState([]);
    const [originalAddresses, setOriginalAddresses] = useState([]);
    const [originalPincodes, setOriginalPincodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isAddingPincode, setIsAddingPincode] = useState(false);
    const [newAddress, setNewAddress] = useState('');
    const [newPincode, setNewPincode] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    // Reference for pincode input field
    const pincodeInputRef = useRef(null);

    useEffect(() => {
        if (user && user._id) {
            fetchUserData();
        }
    }, [user]);

    // Check if there are changes compared to original data
    useEffect(() => {
        const addressesChanged = JSON.stringify(addresses) !== JSON.stringify(originalAddresses);
        const pincodesChanged = JSON.stringify(pincodes) !== JSON.stringify(originalPincodes);
        setHasChanges(addressesChanged || pincodesChanged);
    }, [addresses, pincodes, originalAddresses, originalPincodes]);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            // Ensure token is properly formatted with Bearer prefix
            const token = user.token;
            if (!token) {
                throw new Error('Authentication token is missing');
            }

            console.log('Using token for auth:', token.substring(0, 10) + '...');

            const response = await axios.get(`https://a-kart-backend.onrender.com/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });

            console.log('User data response:', response.data);

            // Set addresses and pincodes from user data
            const userData = response.data;
            const userAddresses = userData.address || [];
            const userPincodes = userData.pincode || [];

            setAddresses(userAddresses);
            setPincodes(userPincodes);
            setOriginalAddresses([...userAddresses]);
            setOriginalPincodes([...userPincodes]);

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to load user data. Please try again.');
            setIsLoading(false);
        }
    };

    const validateAddress = () => {
        const errors = {};
        if (!newAddress.trim()) errors.address = 'Address is required';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePincode = () => {
        const errors = {};
        if (!newPincode.trim()) errors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(newPincode)) errors.pincode = 'Pincode must be 6 digits';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddAddress = () => {
        if (!validateAddress()) return;

        const updatedAddresses = [...addresses, newAddress];
        setAddresses(updatedAddresses);
        setNewAddress('');
        setIsAddingAddress(false);
    };

    const handleAddPincode = () => {
        if (!validatePincode()) return;

        const updatedPincodes = [...pincodes, newPincode];
        setPincodes(updatedPincodes);
        setNewPincode('');
        setIsAddingPincode(false);
    };

    const handleChangeAddress = (index, value) => {
        const newAddresses = [...addresses];
        newAddresses[index] = value;
        setAddresses(newAddresses);
    };

    const handleChangePincode = (index, value) => {
        const newPincodes = [...pincodes];
        newPincodes[index] = value;
        setPincodes(newPincodes);
    };

    const handleDeleteAddress = (index) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this address?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const updatedAddresses = addresses.filter((_, i) => i !== index);
                        setAddresses(updatedAddresses);
                    }
                }
            ]
        );
    };

    const handleDeletePincode = (index) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this pincode?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const updatedPincodes = pincodes.filter((_, i) => i !== index);
                        setPincodes(updatedPincodes);
                    }
                }
            ]
        );
    };

    const handleCancelAddressEdit = () => {
        setAddresses([...originalAddresses]);
        setIsAddingAddress(false);
        setNewAddress('');
    };

    const handleCancelPincodeEdit = () => {
        setPincodes([...originalPincodes]);
        setIsAddingPincode(false);
        setNewPincode('');
    };

    const handleSaveChanges = async () => {
        // Check if there are addresses without pincodes
        if (addresses.length > pincodes.length) {
            Alert.alert(
                'Missing Pincode',
                'Pincode is necessary for making an order. Please add a pincode for each address.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setIsAddingPincode(true);
                            // Focus on the pincode input field
                            setTimeout(() => {
                                if (pincodeInputRef.current) {
                                    pincodeInputRef.current.focus();
                                }
                            }, 500);
                        }
                    }
                ]
            );
            return;
        }

        setIsLoading(true);
        try {
            console.log('Saving addresses and pincodes:');
            console.log('Addresses:', addresses);
            console.log('Pincodes:', pincodes);

            // Ensure token is properly formatted with Bearer prefix
            const token = user.token;
            if (!token) {
                throw new Error('Authentication token is missing');
            }

            const response = await axios.put(
                'https://a-kart-backend.onrender.com/auth/updateAddress',
                {
                    userId: user._id,
                    address: addresses,
                    pincode: pincodes
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            console.log('Save changes response:', response.data);

            if (response.data && (response.data.success || response.data.message)) {
                // Update original arrays to match current state
                setOriginalAddresses([...addresses]);
                setOriginalPincodes([...pincodes]);
                setHasChanges(false);
                Alert.alert('Success', 'Addresses and pincodes updated successfully!');
            } else {
                Alert.alert('Error', 'Failed to update addresses and pincodes. Please try again.');
            }
        } catch (error) {
            console.error('Error saving changes:', error.response?.data || error.message || error);
            Alert.alert('Error', 'Failed to update addresses and pincodes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderAddressItem = ({ item, index }) => (
        <View style={[styles.addressCard, { backgroundColor: COLORS.white }]}>
            <TextInput
                style={[styles.addressInput, { color: COLORS.secondary }]}
                value={addresses[index]}
                onChangeText={(text) => handleChangeAddress(index, text)}
                placeholder="Enter address"
                placeholderTextColor={COLORS.gray}
                multiline
            />
            <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: COLORS.error }]}
                onPress={() => handleDeleteAddress(index)}
            >
                <Ionicons name="trash" size={16} color={COLORS.white} />
                <Text style={[styles.deleteButtonText, { color: COLORS.white }]}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPincodeItem = ({ item, index }) => (
        <View style={[styles.pincodeCard, { backgroundColor: COLORS.white }]}>
            <TextInput
                style={[styles.pincodeInput, { color: COLORS.secondary }]}
                value={pincodes[index]}
                onChangeText={(text) => handleChangePincode(index, text)}
                placeholder="Enter pincode"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
                maxLength={6}
            />
            <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: COLORS.error }]}
                onPress={() => handleDeletePincode(index)}
            >
                <Ionicons name="trash" size={16} color={COLORS.white} />
                <Text style={[styles.deleteButtonText, { color: COLORS.white }]}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    if (authLoading || isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: COLORS.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <Header title="Manage Addresses" showBack={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Manage Addresses Section */}
                <View style={[styles.section, { backgroundColor: COLORS.white }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                            Manage Addresses
                        </Text>
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: COLORS.primary }]}
                            onPress={() => setIsAddingAddress(true)}
                        >
                            <Ionicons name="add" size={20} color={COLORS.white} />
                            <Text style={[styles.addButtonText, { color: COLORS.white }]}>
                                Add Address
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {addresses.length === 0 ? (
                        <Text style={[styles.emptyText, { color: COLORS.gray }]}>
                            No addresses added yet.
                        </Text>
                    ) : (
                        addresses.map((address, index) => (
                            <View key={`address-${index}`} style={styles.addressCard}>
                                <TextInput
                                    style={[styles.addressInput, { color: COLORS.secondary }]}
                                    value={address}
                                    onChangeText={(text) => handleChangeAddress(index, text)}
                                    placeholder="Enter address"
                                    placeholderTextColor={COLORS.gray}
                                    multiline
                                />
                                <TouchableOpacity
                                    style={[styles.deleteButton, { backgroundColor: COLORS.error }]}
                                    onPress={() => handleDeleteAddress(index)}
                                >
                                    <Ionicons name="trash" size={16} color={COLORS.white} />
                                    <Text style={[styles.deleteButtonText, { color: COLORS.white }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}

                    {isAddingAddress && (
                        <View style={styles.addNewContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        borderColor: validationErrors.address ? COLORS.error : COLORS.lightGray,
                                        color: COLORS.secondary
                                    }
                                ]}
                                value={newAddress}
                                onChangeText={setNewAddress}
                                placeholder="Enter new address"
                                placeholderTextColor={COLORS.gray}
                                multiline
                            />
                            {validationErrors.address && (
                                <Text style={[styles.errorText, { color: COLORS.error }]}>
                                    {validationErrors.address}
                                </Text>
                            )}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                                    onPress={handleAddAddress}
                                >
                                    <Text style={[styles.actionButtonText, { color: COLORS.white }]}>Add</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: COLORS.gray }]}
                                    onPress={() => {
                                        setIsAddingAddress(false);
                                        setNewAddress('');
                                        setValidationErrors({});
                                    }}
                                >
                                    <Text style={[styles.actionButtonText, { color: COLORS.white }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Manage Pincodes Section */}
                <View style={[styles.section, { backgroundColor: COLORS.white }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                            Manage Pincodes
                        </Text>
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: COLORS.primary }]}
                            onPress={() => setIsAddingPincode(true)}
                        >
                            <Ionicons name="add" size={20} color={COLORS.white} />
                            <Text style={[styles.addButtonText, { color: COLORS.white }]}>
                                Add Pincode
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {pincodes.length === 0 ? (
                        <Text style={[styles.emptyText, { color: COLORS.gray }]}>
                            No pincodes added yet.
                        </Text>
                    ) : (
                        pincodes.map((pincode, index) => (
                            <View key={`pincode-${index}`} style={styles.pincodeCard}>
                                <TextInput
                                    style={[styles.pincodeInput, { color: COLORS.secondary }]}
                                    value={pincode}
                                    onChangeText={(text) => handleChangePincode(index, text)}
                                    placeholder="Enter pincode"
                                    placeholderTextColor={COLORS.gray}
                                    keyboardType="numeric"
                                    maxLength={6}
                                />
                                <TouchableOpacity
                                    style={[styles.deleteButton, { backgroundColor: COLORS.error }]}
                                    onPress={() => handleDeletePincode(index)}
                                >
                                    <Ionicons name="trash" size={16} color={COLORS.white} />
                                    <Text style={[styles.deleteButtonText, { color: COLORS.white }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}

                    {isAddingPincode && (
                        <View style={styles.addNewContainer}>
                            <TextInput
                                ref={pincodeInputRef}
                                style={[
                                    styles.input,
                                    {
                                        borderColor: validationErrors.pincode ? COLORS.error : COLORS.lightGray,
                                        color: COLORS.secondary
                                    }
                                ]}
                                value={newPincode}
                                onChangeText={setNewPincode}
                                placeholder="Enter new pincode"
                                placeholderTextColor={COLORS.gray}
                                keyboardType="numeric"
                                maxLength={6}
                            />
                            {validationErrors.pincode && (
                                <Text style={[styles.errorText, { color: COLORS.error }]}>
                                    {validationErrors.pincode}
                                </Text>
                            )}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                                    onPress={handleAddPincode}
                                >
                                    <Text style={[styles.actionButtonText, { color: COLORS.white }]}>Add</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: COLORS.gray }]}
                                    onPress={() => {
                                        setIsAddingPincode(false);
                                        setNewPincode('');
                                        setValidationErrors({});
                                    }}
                                >
                                    <Text style={[styles.actionButtonText, { color: COLORS.white }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Save Changes Button */}
                {hasChanges && (
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: COLORS.primary },
                            isLoading && { opacity: 0.7 }
                        ]}
                        onPress={handleSaveChanges}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                            <Text style={[styles.saveButtonText, { color: COLORS.white }]}>
                                Save Changes
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
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
        flexGrow: 1,
        paddingBottom: 30,
    },
    section: {
        margin: 15,
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    addButtonText: {
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 14,
        marginVertical: 15,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 10,
    },
    pincodeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 10,
    },
    addressInput: {
        flex: 1,
        fontSize: 14,
        padding: 5,
    },
    pincodeInput: {
        flex: 1,
        fontSize: 14,
        padding: 5,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        marginLeft: 10,
    },
    deleteButtonText: {
        marginLeft: 5,
        fontSize: 12,
    },
    addNewContainer: {
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    errorText: {
        fontSize: 12,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    saveButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 15,
        marginTop: 10,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ManageAddressScreen; 