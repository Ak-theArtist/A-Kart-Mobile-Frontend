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

    // Social media links
    const socialLinks = {
        facebook: 'https://www.facebook.com/share/1A3EUMzogm/',
        instagram: 'https://www.instagram.com/ak_drawing_world?igsh=MXJqYTBzb2ZyeWNsNA==',
        linkedin: 'https://www.linkedin.com/in/akashkumar-thedev?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
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
                        <Text style={[styles.linkHeader, { color: colors.secondary }]}>Quick Links</Text>
                        <TouchableOpacity onPress={() => openLink('https://a-kart-frontend.onrender.com')}>
                            <Text style={[styles.linkText, { color: colors.gray }]}>Website</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openLink('mailto:kumarakash91384@gmail.com')}>
                            <Text style={[styles.linkText, { color: colors.gray }]}>Contact Us</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.lightGray }]} />

            <View style={styles.bottomSection}>
                <View style={styles.socialIcons}>
                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() => openLink(socialLinks.facebook)}
                    >
                        <Ionicons name="logo-facebook" size={24} color={isDarkMode ? colors.primaryAlt : colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() => openLink(socialLinks.linkedin)}
                    >
                        <Ionicons name="logo-linkedin" size={24} color={isDarkMode ? colors.primaryAlt : colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() => openLink(socialLinks.instagram)}
                    >
                        <Ionicons name="logo-instagram" size={24} color={isDarkMode ? colors.primaryAlt : colors.primary} />
                    </TouchableOpacity>
                </View>

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
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkColumn: {
        marginLeft: 0,
        alignItems: 'center',
    },
    linkHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    linkText: {
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
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
        padding: 8,
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