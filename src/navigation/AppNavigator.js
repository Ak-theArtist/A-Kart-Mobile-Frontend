import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, View, Image, Text, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
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
import AdminScreen from '../screens/AdminScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ManageAddressScreen from '../screens/ManageAddressScreen';
import ContactScreen from '../screens/ContactScreen';

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
    const { colors } = useContext(ThemeContext);
    const themeColors = colors || DEFAULT_COLORS;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
                source={require('../../public/assets/logo.jpg')}
                style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8 }}
            />
            <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: themeColors.secondary
            }}>
                {title}
            </Text>
        </View>
    );
};

// Main tab navigator
const MainTabNavigator = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user && user.isAdmin;

    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
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
            <Tab.Screen
                name="Cart"
                component={CartStack}
                options={{
                    tabBarLabel: 'Cart',
                }}
            />
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

// Common stack screen options
const getScreenOptions = (colors) => ({
    headerTitleAlign: 'center',
    headerStyle: {
        backgroundColor: colors.white,
        elevation: 0,
        shadowOpacity: 0,
    },
    headerTitleStyle: {
        fontWeight: 'bold',
        color: colors.secondary,
    },
    headerTintColor: colors.secondary,
});

// Home stack
const HomeStack = () => {
    const { colors } = useContext(ThemeContext);
    const themeColors = colors || DEFAULT_COLORS;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="Product" component={ProductScreen} />
            <Stack.Screen name="Contact" component={ContactScreen} />
        </Stack.Navigator>
    );
};

// Shop stack
const ShopStack = () => {
    const { colors } = useContext(ThemeContext);
    const themeColors = colors || DEFAULT_COLORS;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ShopScreen" component={ShopScreen} />
            <Stack.Screen name="Category" component={CategoryScreen} />
            <Stack.Screen name="Product" component={ProductScreen} />
        </Stack.Navigator>
    );
};

// Cart stack
const CartStack = () => {
    const { colors } = useContext(ThemeContext);
    const themeColors = colors || DEFAULT_COLORS;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CartScreen" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Product" component={ProductScreen} />
        </Stack.Navigator>
    );
};

// Profile stack
const ProfileStack = () => {
    const { colors } = useContext(ThemeContext);
    const themeColors = colors || DEFAULT_COLORS;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    const { colors } = useContext(ThemeContext);
    const themeColors = colors || DEFAULT_COLORS;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminScreen" component={AdminScreen} />
        </Stack.Navigator>
    );
};

// Auth stack
const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
            />
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

    return (
        <View style={{ flex: 1, backgroundColor: themeColors.background }}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={themeColors.background}
                translucent={false}
            />
            <NavigationContainer
                theme={{
                    dark: isDarkMode,
                    colors: {
                        primary: themeColors.primary,
                        background: themeColors.background,
                        card: themeColors.white,
                        text: themeColors.secondary,
                        border: themeColors.lightGray,
                        notification: themeColors.primary,
                    }
                }}
            >
                <Stack.Navigator screenOptions={{ headerShown: false }}>
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