import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';

const ContactScreen = () => {
    const { colors } = useContext(ThemeContext);

    const appFeatures = [
        "Easy and secure shopping experience",
        "Wide range of products across multiple categories",
        "Real-time order tracking",
        "Secure payment options",
        "User-friendly interface",
        "Fast delivery service",
        "24/7 Customer support"
    ];

    const handleEmailPress = () => {
        Linking.openURL('mailto:kumarakash91384@gmail.com');
    };

    const handlePhonePress = () => {
        Linking.openURL('tel:+919528346957');
    };

    const renderFeatureItem = (feature) => (
        <View
            key={feature}
            style={[styles.featureItem, { backgroundColor: colors.primary }]}
        >
            <Ionicons
                name="checkmark-circle"
                size={20}
                color="white"
                style={styles.featureIcon}
            />
            <Text style={[styles.featureText, { color: 'white' }]}>
                {feature}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Contact Us" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* App Info Section */}
                <View style={[styles.section, { backgroundColor: colors.white }]}>
                    <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                        About A-Kart
                    </Text>
                    <Text style={[styles.description, { color: colors.secondary }]}>
                        A-Kart is your one-stop shopping destination for all your needs.
                        We provide a seamless shopping experience with a wide range of products
                        and exceptional customer service.
                    </Text>
                </View>

                {/* Features Section */}
                <View style={[styles.section, { backgroundColor: colors.white }]}>
                    <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                        Key Features
                    </Text>
                    <View style={styles.featuresList}>
                        {appFeatures.map(renderFeatureItem)}
                    </View>
                </View>

                {/* Developer Info */}
                <View style={[styles.section, { backgroundColor: colors.white }]}>
                    <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                        Developer
                    </Text>
                    <Text style={[styles.developerName, { color: colors.primary }]}>
                        Akash Kumar
                    </Text>
                    <Text style={[styles.developerRole, { color: colors.secondary }]}>
                        Full Stack Developer
                    </Text>
                </View>

                {/* Contact Section */}
                <View style={[styles.section, { backgroundColor: colors.white }]}>
                    <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                        Contact Information
                    </Text>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={handleEmailPress}
                    >
                        <Ionicons name="mail" size={24} color={colors.primary} />
                        <Text style={[styles.contactText, { color: colors.secondary }]}>
                            kumarakash91384@gmail.com
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={handlePhonePress}
                    >
                        <Ionicons name="call" size={24} color={colors.primary} />
                        <Text style={[styles.contactText, { color: colors.secondary }]}>
                            91 9528346957
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.contactItem}>
                        <Ionicons name="location" size={24} color={colors.primary} />
                        <Text style={[styles.contactText, { color: colors.secondary }]}>
                            Mathura, UP, India
                        </Text>
                    </View>
                </View>

                {/* Support Hours */}
                <View style={[styles.section, { backgroundColor: colors.white }]}>
                    <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                        Support Hours
                    </Text>
                    <Text style={[styles.supportText, { color: colors.secondary }]}>
                        Monday - Saturday: 9:00 AM - 8:00 PM{'\n'}
                        Sunday: 10:00 AM - 6:00 PM
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 15,
    },
    section: {
        marginBottom: 20,
        borderRadius: 10,
        padding: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    featuresList: {
        gap: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
    },
    featureIcon: {
        marginRight: 10,
    },
    featureText: {
        fontSize: 15,
        flex: 1,
    },
    developerName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    developerRole: {
        fontSize: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    contactText: {
        fontSize: 16,
        marginLeft: 15,
    },
    supportText: {
        fontSize: 16,
        lineHeight: 24,
    },
});

export default ContactScreen; 