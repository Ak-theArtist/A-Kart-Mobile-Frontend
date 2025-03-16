import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register, isLoading } = useContext(AuthContext);
    const { colors } = useContext(ThemeContext);

    const handleRegister = async () => {
        // Reset error
        setError('');

        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Call register function from AuthContext
        try {
            await register(name, email, password);
            // Navigate to login with email prefilled
            navigation.navigate('Login', { email });
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../public/assets/logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.title, { color: colors.primary }]}>A-Kart</Text>
                    <Text style={[styles.subtitle, { color: colors.secondary }]}>Create a new account</Text>
                </View>

                <View style={styles.formContainer}>
                    {/* Name Input */}
                    <View style={[styles.inputContainer, { borderColor: colors.lightGray }]}>
                        <TextInput
                            style={[styles.input, { color: colors.secondary }]}
                            placeholder="Full Name"
                            placeholderTextColor={colors.gray}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email Input */}
                    <View style={[styles.inputContainer, { borderColor: colors.lightGray }]}>
                        <TextInput
                            style={[styles.input, { color: colors.secondary }]}
                            placeholder="Email"
                            placeholderTextColor={colors.gray}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={[styles.inputContainer, { borderColor: colors.lightGray }]}>
                        <TextInput
                            style={[styles.input, { color: colors.secondary }]}
                            placeholder="Password"
                            placeholderTextColor={colors.gray}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {/* Confirm Password Input */}
                    <View style={[styles.inputContainer, { borderColor: colors.lightGray }]}>
                        <TextInput
                            style={[styles.input, { color: colors.secondary }]}
                            placeholder="Confirm Password"
                            placeholderTextColor={colors.gray}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                    ) : null}

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.registerButton, { backgroundColor: colors.primary }]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <Text style={[styles.registerButtonText, { color: colors.white }]}>REGISTER</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                    <Text style={[styles.loginText, { color: colors.secondary }]}>
                        Already have an account?
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={[styles.loginLink, { color: colors.primary }]}>
                            Login
                        </Text>
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
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
    },
    formContainer: {
        paddingHorizontal: 30,
    },
    inputContainer: {
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
    },
    input: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    errorText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    registerButton: {
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    loginText: {
        fontSize: 16,
        marginRight: 5,
    },
    loginLink: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterScreen; 