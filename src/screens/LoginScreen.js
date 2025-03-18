import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation, route }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error } = useContext(AuthContext);
    const { colors, isDarkMode } = useContext(ThemeContext);

    // Set email from route params if available (coming from registration)
    useEffect(() => {
        if (route.params?.email) {
            setEmail(route.params.email);
        }
    }, [route.params]);

    const handleLogin = async () => {
        // Validate inputs
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }

        if (!password) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        try {
            await login(email.trim(), password);
        } catch (err) {
            console.error('Login error in component:', err);
            Alert.alert('Login Failed', 'An unexpected error occurred. Please try again.');
        }
    };

    // Choose the appropriate logo based on dark mode
    const logoSource = isDarkMode
        ? require('../../public/assets/logo_dark.jpg')
        : require('../../public/assets/logo.jpg');

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={logoSource}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.title, { color: colors.primary }]}>A-Kart</Text>
                    <Text style={[styles.subtitle, { color: colors.secondary }]}>Login to your account</Text>
                </View>

                <View style={styles.formContainer}>
                    <TouchableOpacity
                        style={[styles.inputContainer, { borderColor: colors.lightGray }]}
                        activeOpacity={0.8}
                        onPress={() => {
                            // Find the TextInput and focus it
                            this.emailInput && this.emailInput.focus();
                        }}
                    >
                        <TextInput
                            ref={(input) => { this.emailInput = input; }}
                            style={[styles.input, { color: colors.secondary, flex: 1 }]}
                            placeholder="Email"
                            placeholderTextColor={colors.gray}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.inputContainer, { borderColor: colors.lightGray }]}
                        activeOpacity={0.8}
                        onPress={() => {
                            // Find the TextInput and focus it
                            this.passwordInput && this.passwordInput.focus();
                        }}
                    >
                        <TextInput
                            ref={(input) => { this.passwordInput = input; }}
                            style={[styles.input, { color: colors.secondary, flex: 1 }]}
                            placeholder="Password"
                            placeholderTextColor={colors.gray}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={22}
                                color={colors.gray}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    {error ? (
                        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: colors.primary }]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <Text style={[styles.loginButtonText, { color: colors.white }]}>LOGIN</Text>
                        )}
                    </TouchableOpacity>

                    {/* Forgot Password option temporarily hidden
                    <TouchableOpacity style={styles.forgotPasswordContainer}>
                        <Text style={[styles.forgotPasswordText, { color: colors.gray }]}>
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>
                    */}
                </View>

                <View style={styles.registerContainer}>
                    <Text style={[styles.registerText, { color: colors.secondary }]}>
                        Don't have an account?
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={[styles.registerLink, { color: colors.primary }]}>
                            Register
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
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 10,
        borderRadius: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
    },
    formContainer: {
        marginBottom: 30,
    },
    inputContainer: {
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginBottom: 15,
        fontSize: 14,
        textAlign: 'center',
    },
    loginButton: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotPasswordContainer: {
        alignItems: 'center',
        marginTop: 15,
    },
    forgotPasswordText: {
        fontSize: 14,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        fontSize: 14,
        marginRight: 5,
    },
    registerLink: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default LoginScreen; 