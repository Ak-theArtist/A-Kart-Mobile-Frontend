import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

// Default colors in case ThemeContext is not available
const DEFAULT_COLORS = {
    primary: 'rgb(9, 64, 147)',
    secondary: '#333333',
    background: '#f8f8f8',
    white: '#ffffff',
    black: '#000000',
    gray: '#888888',
    lightGray: '#eeeeee',
};

const Footer = () => {
    const { colors, isDarkMode } = useContext(ThemeContext);
    const currentYear = new Date().getFullYear();

    const openLink = (url) => {
        Linking.openURL(url);
    };

    // Choose the appropriate logo based on dark mode
    const logoSource = isDarkMode
        ? require('../../public/assets/logo_dark.jpg')
        : require('../../public/assets/logo.jpg');

    return (
        <View style={[styles.container, { backgroundColor: colors.white }]}>
            <View style={styles.topSection}>
                <View style={styles.logoSection}>
                    <Image
                        source={logoSource}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={[styles.logoText, { color: colors.primary }]}>A-Kart</Text>
                    <Text style={[styles.tagline, { color: colors.secondary }]}>
                        Shop with confidence
                    </Text>
                </View>

                <View style={styles.linksSection}>
                    <View style={styles.linkColumn}>
                        <Text style={[styles.linkHeader, { color: colors.secondary }]}>Shop</Text>
                        <TouchableOpacity>
                            <Text style={[styles.linkText, { color: colors.gray }]}>Products</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={[styles.linkText, { color: colors.gray }]}>Categories</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={[styles.linkText, { color: colors.gray }]}>Deals</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.linkColumn}>
                        <Text style={[styles.linkHeader, { color: colors.secondary }]}>Support</Text>
                        <TouchableOpacity>
                            <Text style={[styles.linkText, { color: colors.gray }]}>Contact Us</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={[styles.linkText, { color: colors.gray }]}>FAQs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={[styles.linkText, { color: colors.gray }]}>Shipping</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.lightGray }]} />

            <View style={styles.bottomSection}>
                <View style={styles.socialIcons}>
                    <TouchableOpacity style={styles.iconContainer}>
                        <Ionicons name="logo-facebook" size={24} color={isDarkMode ? colors.primaryAlt : colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconContainer}>
                        <Ionicons name="logo-twitter" size={24} color={isDarkMode ? colors.primaryAlt : colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconContainer}>
                        <Ionicons name="logo-instagram" size={24} color={isDarkMode ? colors.primaryAlt : colors.primary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => openLink('https://a-kart-frontend.onrender.com')}>
                    <Text style={[styles.websiteLink, { color: isDarkMode ? colors.primaryAlt : colors.primary }]}>
                        Official Website
                    </Text>
                </TouchableOpacity>

                <Text style={[styles.copyright, { color: colors.gray }]}>
                    © {currentYear} A-Kart. All rights reserved.
                </Text>

                <Text style={[styles.developer, { color: isDarkMode ? colors.primaryAlt : colors.primary }]}>
                    Developed By - Akash Kumar
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    logoSection: {
        flex: 1,
    },
    logoImage: {
        width: 80,
        height: 80,
        marginBottom: 5,
        borderRadius: 50,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    tagline: {
        fontSize: 14,
    },
    linksSection: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    linkColumn: {
        marginLeft: 20,
    },
    linkHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    linkText: {
        fontSize: 14,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        marginVertical: 15,
    },
    bottomSection: {
        alignItems: 'center',
    },
    socialIcons: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    iconContainer: {
        marginHorizontal: 10,
    },
    websiteLink: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        textDecorationLine: 'underline',
    },
    copyright: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8,
    },
    developer: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
    },
});

export default Footer; 