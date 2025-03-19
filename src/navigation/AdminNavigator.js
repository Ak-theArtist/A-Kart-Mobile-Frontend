import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeContext } from '../context/ThemeContext';

// Import admin screens
import AdminDashboard from '../screens/Admin/AdminDashboard';
import ListProduct from '../screens/Admin/ListProduct';
import AddProduct from '../screens/Admin/AddProduct';
import AdminOrders from '../screens/Admin/AdminOrders';
import AllUsers from '../screens/Admin/AllUsers';
import EditProduct from '../screens/Admin/EditProduct';

const Stack = createStackNavigator();

const AdminNavigator = () => {
    const { isDarkMode } = useContext(ThemeContext);

    return (
        <Stack.Navigator
            initialRouteName="AdminDashboard"
            screenOptions={{
                headerShown: false,
                cardStyle: {
                    backgroundColor: isDarkMode ? '#000000' : '#f8f8f8',
                }
            }}
        >
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="ListProduct" component={ListProduct} />
            <Stack.Screen name="AddProduct" component={AddProduct} />
            <Stack.Screen name="EditProduct" component={EditProduct} />
            <Stack.Screen name="AdminOrders" component={AdminOrders} />
            <Stack.Screen name="AllUsers" component={AllUsers} />
        </Stack.Navigator>
    );
};

export default AdminNavigator; 