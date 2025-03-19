import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, View, Image, Text, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { ShopContext } from '../context/ShopContext';
import CustomTabBar from '../components/CustomTabBar';
import SplashScreen from '../screens/SplashScreen';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import CategoryScreen from '../screens/CategoryScreen';
import ProductScreen from '../screens/ProductScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ManageAddressScreen from '../screens/ManageAddressScreen';
import ContactScreen from '../screens/ContactScreen';

// Import admin navigator
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

// Custom header title component with logo
const LogoTitle = ({ title = 'A-Kart' }) => {
    const { isDarkMode } = useContext(ThemeContext);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
                source={require('../../public/assets/logo.jpg')}
                style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8 }}
            />
            <Text style={{
                fontSize: 18,
                color: isDarkMode ? '#ffffff' : '#000000',
            }}>
                {title}
            </Text>
        </View>
    );
};

// Common stack screen options
const getScreenOptions = (isDarkMode) => ({
    headerTitleAlign: 'center',
    headerStyle: {
        backgroundColor: isDarkMode ? '#000000' : '#f8f8f8',
        elevation: 0,
        shadowOpacity: 0,
    },
    headerTitleStyle: {
        fontSize: 18,
        color: isDarkMode ? '#ffffff' : '#000000',
    },
    headerTintColor: isDarkMode ? '#ffffff' : '#000000',
    headerBackTitleVisible: false,
    cardStyle: {
        backgroundColor: isDarkMode ? '#000000' : '#f8f8f8',
    }
});

// Main tab navigator
const MainTabNavigator = () => {
    const { userRole } = useContext(ShopContext);
    const { isDarkMode } = useContext(ThemeContext);
    const isAdmin = userRole === 'admin';

    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                    borderTopColor: isDarkMode ? '#333333' : '#eeeeee',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="Shop"
                component={ShopStack}
                options={{
                    tabBarLabel: 'Shop',
                }}
            />
            {!isAdmin && (
                <Tab.Screen
                    name="Cart"
                    component={CartStack}
                    options={{
                        tabBarLabel: 'Cart',
                    }}
                />
            )}
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    tabBarLabel: 'Profile',
                }}
            />
            {isAdmin && (
                <Tab.Screen
                    name="Admin"
                    component={AdminStack}
                    options={{
                        tabBarLabel: 'Admin',
                    }}
                />
            )}
        </Tab.Navigator>
    );
};

// Home stack
const HomeStack = () => {
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <Stack.Navigator screenOptions={{
            ...getScreenOptions(isDarkMode),
            headerShown: false
        }}>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Contact" component={ContactScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

// Shop stack
const ShopStack = () => {
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <Stack.Navigator screenOptions={{
            ...getScreenOptions(isDarkMode),
            headerShown: false
        }}>
            <Stack.Screen name="ShopScreen" component={ShopScreen} />
            <Stack.Screen name="Category" component={CategoryScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: true }} />
        </Stack.Navigator>
    );
};

// Cart stack
const CartStack = () => {
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <Stack.Navigator screenOptions={{
            ...getScreenOptions(isDarkMode),
            headerShown: false
        }}>
            <Stack.Screen name="CartScreen" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: true }} />
        </Stack.Navigator>
    );
};

// Profile stack
const ProfileStack = () => {
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            cardStyle: {
                backgroundColor: isDarkMode ? '#000000' : '#f8f8f8',
            }
        }}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
            <Stack.Screen name="ManageAddress" component={ManageAddressScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
    );
};

// Admin stack
const AdminStack = () => {
    return <AdminNavigator />;
};

// Auth stack
const AuthStack = () => {
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <Stack.Navigator screenOptions={{
            ...getScreenOptions(isDarkMode),
            headerShown: false
        }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true }} />
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    const { user, isLoading } = useContext(AuthContext);
    const { isDarkMode, colors } = useContext(ThemeContext);

    // Use colors from context or default colors if not available
    const themeColors = colors || DEFAULT_COLORS;

    // Show SplashScreen while checking authentication status
    if (isLoading) {
        return <SplashScreen />;
    }

    // Safe navigation theme that avoids style issues
    const navigationTheme = {
        dark: isDarkMode,
        colors: {
            primary: themeColors.primary,
            background: themeColors.background,
            card: themeColors.white,
            text: themeColors.secondary,
            border: themeColors.lightGray,
            notification: themeColors.primary,
        },
        // Override default styles that cause issues
        headerTitleStyle: {
            fontSize: 18,
            color: isDarkMode ? '#ffffff' : '#000000',
        },
        headerStyle: {
            backgroundColor: isDarkMode ? '#000000' : '#f8f8f8',
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: themeColors.background }}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={themeColors.background}
                translucent={false}
            />
            <NavigationContainer
                theme={navigationTheme}
                // Disable default navigation features that can cause issues
                documentTitle={{
                    enabled: false
                }}
                linking={{
                    enabled: false
                }}
            >
                <Stack.Navigator screenOptions={{
                    headerShown: false,
                    // Force disable animations to avoid transition issues
                    animationEnabled: false,
                    gestureEnabled: false
                }}>
                    {user ? (
                        <Stack.Screen
                            name="Main"
                            component={MainTabNavigator}
                        />
                    ) : (
                        <Stack.Screen
                            name="Auth"
                            component={AuthStack}
                        />
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    );
};

export default AppNavigator; 