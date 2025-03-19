import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    SafeAreaView
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
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

const SettingsScreen = ({ navigation }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { isDarkMode, toggleDarkMode, colors } = useContext(ThemeContext);

    // Safely get theme colors with error handling
    let COLORS;
    try {
        COLORS = colors ? colors : DEFAULT_COLORS;
    } catch (error) {
        console.error('SettingsScreen: Error getting theme colors:', error);
        COLORS = DEFAULT_COLORS;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title="Settings" showBack={true} showCart={false} />
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={COLORS.background}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Appearance Section */}
                <View style={[styles.section, { backgroundColor: COLORS.white }]}>
                    <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                        Appearance
                    </Text>

                    {/* Dark Mode Toggle */}
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="moon-outline" size={24} color={COLORS.primary} />
                            <Text style={[styles.settingText, { color: COLORS.secondary }]}>
                                Dark Mode
                            </Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                            thumbColor={COLORS.white}
                        />
                    </View>
                </View>

                {/* Notifications Section */}
                <View style={[styles.section, { backgroundColor: COLORS.white }]}>
                    <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                        Notifications
                    </Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
                            <Text style={[styles.settingText, { color: COLORS.secondary }]}>
                                Push Notifications
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                            thumbColor={COLORS.white}
                        />
                    </View>
                </View>

                {/* About Section */}
                <View style={[styles.section, { backgroundColor: COLORS.white }]}>
                    <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                        About
                    </Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
                            <Text style={[styles.settingText, { color: COLORS.secondary }]}>
                                App Version
                            </Text>
                        </View>
                        <Text style={[styles.versionText, { color: COLORS.gray }]}>1.0.0</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        marginHorizontal: 15,
        marginTop: 20,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        marginLeft: 10,
    },
    versionText: {
        fontSize: 14,
    },
});

export default SettingsScreen; 