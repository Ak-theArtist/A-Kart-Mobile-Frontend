import React, { useState, useContext, useEffect } from 'react';
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

const EditProfileScreen = ({ navigation }) => {
    const { user, updateProfile, isLoading } = useContext(AuthContext);
    const { colors } = useContext(ThemeContext);

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        gender: 'Male',
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                mobileNumber: user.mobileNumber || '',
                gender: user.gender || 'Male',
            });
        }
    }, [user]);

    const validateInput = (field, value) => {
        let error = '';
        if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                error = 'Invalid email address';
            }
        } else if (field === 'mobileNumber') {
            if (!/^\d{10}$/.test(value)) {
                error = 'Mobile number must be 10 digits';
            }
        }
        setValidationErrors(prev => ({ ...prev, [field]: error }));
        return !error;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        validateInput(field, value);
    };

    const handleSubmit = async () => {
        // Validate all fields
        let isValid = true;
        Object.entries(formData).forEach(([field, value]) => {
            if (!validateInput(field, value)) {
                isValid = false;
            }
        });

        if (!isValid) {
            Alert.alert('Validation Error', 'Please fix the errors in the form.');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateProfile(formData);
            setSuccessMessage('Profile updated successfully!');
            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
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
            <Header title="Edit Profile" showBack={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={[styles.formContainer, { backgroundColor: COLORS.white }]}>
                    <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                        Personal Information
                    </Text>

                    {successMessage ? (
                        <Text style={[styles.successMessage, { color: COLORS.success }]}>
                            {successMessage}
                        </Text>
                    ) : null}

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: COLORS.secondary }]}>Name</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: validationErrors.name ? COLORS.error : COLORS.lightGray,
                                    color: COLORS.secondary
                                }
                            ]}
                            value={formData.name}
                            onChangeText={(text) => handleChange('name', text)}
                            placeholder="Enter your name"
                            placeholderTextColor={COLORS.gray}
                        />
                        {validationErrors.name ? (
                            <Text style={[styles.errorText, { color: COLORS.error }]}>
                                {validationErrors.name}
                            </Text>
                        ) : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: COLORS.secondary }]}>Email</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: validationErrors.email ? COLORS.error : COLORS.lightGray,
                                    color: COLORS.secondary
                                }
                            ]}
                            value={formData.email}
                            onChangeText={(text) => handleChange('email', text)}
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.gray}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {validationErrors.email ? (
                            <Text style={[styles.errorText, { color: COLORS.error }]}>
                                {validationErrors.email}
                            </Text>
                        ) : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: COLORS.secondary }]}>Mobile Number</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: validationErrors.mobileNumber ? COLORS.error : COLORS.lightGray,
                                    color: COLORS.secondary
                                }
                            ]}
                            value={formData.mobileNumber}
                            onChangeText={(text) => handleChange('mobileNumber', text)}
                            placeholder="Enter your mobile number"
                            placeholderTextColor={COLORS.gray}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                        {validationErrors.mobileNumber ? (
                            <Text style={[styles.errorText, { color: COLORS.error }]}>
                                {validationErrors.mobileNumber}
                            </Text>
                        ) : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: COLORS.secondary }]}>Gender</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => handleChange('gender', 'Male')}
                            >
                                <View style={[
                                    styles.radioButton,
                                    { borderColor: COLORS.primary }
                                ]}>
                                    {formData.gender === 'Male' && (
                                        <View style={[
                                            styles.radioButtonSelected,
                                            { backgroundColor: COLORS.primary }
                                        ]} />
                                    )}
                                </View>
                                <Text style={[styles.radioLabel, { color: COLORS.secondary }]}>Male</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => handleChange('gender', 'Female')}
                            >
                                <View style={[
                                    styles.radioButton,
                                    { borderColor: COLORS.primary }
                                ]}>
                                    {formData.gender === 'Female' && (
                                        <View style={[
                                            styles.radioButtonSelected,
                                            { backgroundColor: COLORS.primary }
                                        ]} />
                                    )}
                                </View>
                                <Text style={[styles.radioLabel, { color: COLORS.secondary }]}>Female</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: COLORS.primary },
                            isSubmitting && { opacity: 0.7 }
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                            <Text style={[styles.submitButtonText, { color: COLORS.white }]}>
                                Update Profile
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
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
    formContainer: {
        margin: 15,
        padding: 20,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    successMessage: {
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    errorText: {
        fontSize: 14,
        marginTop: 5,
    },
    radioGroup: {
        flexDirection: 'row',
        marginTop: 10,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 30,
    },
    radioButton: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioButtonSelected: {
        height: 10,
        width: 10,
        borderRadius: 5,
    },
    radioLabel: {
        fontSize: 16,
    },
    submitButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditProfileScreen; 