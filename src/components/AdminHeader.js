import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { COLORS } from '../constants/colors';

const AdminHeader = ({ title, showBack = true }) => {
    const navigation = useNavigation();
    const { isDarkMode } = useContext(ThemeContext);

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // Fallback if can't go back
            navigation.dispatch(
                CommonActions.navigate({
                    name: 'AdminDashboard',
                })
            );
        }
    };

    // Choose the appropriate logo based on dark mode
    const logoSource = isDarkMode
        ? require('../../public/assets/logo_dark.jpg')
        : require('../../public/assets/logo.jpg');

    return (
        <View style={[
            styles.header,
            {
                backgroundColor: isDarkMode ? COLORS.black : COLORS.white,
                borderBottomColor: isDarkMode ? COLORS.darkGray : COLORS.lightGray
            }
        ]}>
            <View style={styles.leftContainer}>
                {showBack && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackPress}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={isDarkMode ? COLORS.white : COLORS.secondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.centerContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={logoSource}
                        style={styles.logo}
                        resizeMode="cover"
                    />
                </View>
                <Text style={[
                    styles.title,
                    { color: isDarkMode ? COLORS.white : COLORS.secondary }
                ]}>
                    {title}
                </Text>
            </View>

            <View style={styles.rightContainer}></View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    leftContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    centerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    logoContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
    },
    logo: {
        width: 30,
        height: 30,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default AdminHeader; 