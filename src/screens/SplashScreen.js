import React from 'react';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const SplashScreen = () => {
    const { colors, isDarkMode } = React.useContext(ThemeContext);

    // Choose the appropriate logo based on dark mode
    const logoSource = isDarkMode
        ? require('../../public/assets/logo_dark.jpg')
        : require('../../public/assets/logo.jpg');

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.logoContainer}>
                <Image
                    source={logoSource}
                    style={styles.logo}
                    resizeMode="cover"
                />
            </View>
            <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.spinner}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#f0f0f0',
        backgroundColor: '#ffffff',
        marginBottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    spinner: {
        marginTop: 20,
    }
});

export default SplashScreen; 