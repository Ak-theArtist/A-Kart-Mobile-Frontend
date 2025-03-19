# A-Kart Mobile

A React Native mobile application for the A-Kart e-commerce platform.

## Features

- User authentication (login/register)
- Browse products by category
- View product details
- Add products to cart
- Manage cart items
- User profile management
- Admin dashboard (for admin users)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS development)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Frontend-Mobile
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
yarn start
```

4. Run on a device or emulator:

- Press `a` to run on Android emulator
- Press `i` to run on iOS simulator (macOS only)
- Scan the QR code with the Expo Go app on your physical device

## Environment Variables

The app uses the following environment variables:

- `EXPO_PUBLIC_API_URL`: The URL of the backend API

Create a `.env` file in the root directory with the following content:

```
EXPO_PUBLIC_API_URL=https://a-kart-backend.onrender.com
```

## Project Structure

- `src/components`: Reusable UI components
- `src/context`: Context providers for state management
- `src/navigation`: Navigation configuration
- `src/screens`: Screen components
- `src/utils`: Utility functions and API configuration
- `assets`: Static assets like images and fonts

## Backend API

This mobile app connects to the same backend API as the web version of A-Kart. The API is hosted at:

```
https://a-kart-backend.onrender.com
```

## License

MIT

# A-Kart Mobile App - Admin Panel Documentation

## Overview

The A-Kart mobile app includes an admin panel that allows administrators to manage products, users, and orders. The admin panel is only accessible to users with admin privileges and provides a comprehensive set of features for managing the e-commerce platform.

## Features

### Product Management

- View all products in a list format
- Add new products with images, descriptions, and pricing
- Edit existing product details
- Delete products from the catalog
- Manage product categories

### User Management

- View all registered users
- Grant or revoke admin privileges
- Delete user accounts
- View user details including email and role

### Order Management

- View all orders with status and details
- Update order status (Processing, Shipped, Delivered)
- Track order progress
- View order history

## Technical Implementation

### Navigation

The admin panel uses a dedicated `AdminNavigator` component that manages navigation between different admin screens:

- ListProducts
- AddProduct
- AdminOrders
- AllUsers

### State Management

Admin functionality is managed through the `ShopContext`, which provides:

- User role verification
- API integration for admin operations
- State management for products, users, and orders

### Components

1. **ListProducts**

   - Displays all products in a scrollable list
   - Provides options to edit or delete products
   - Includes a floating action button to add new products

2. **AddProduct**

   - Form for adding new products
   - Image picker integration
   - Category selection
   - Validation for required fields

3. **AdminOrders**

   - Lists all orders with their current status
   - Order management actions
   - Status update functionality
   - Order details display

4. **AllUsers**
   - User management interface
   - Role modification options
   - User deletion functionality
   - User information display

### Security

- Role-based access control
- API endpoint protection
- Token-based authentication
- Secure image handling

## Dependencies

- @react-navigation/stack
- react-native-paper
- react-native-image-picker
- @react-native-picker/picker
- react-native-vector-icons

## Getting Started

1. Ensure you have admin privileges
2. Access the admin panel through the bottom tab navigator
3. Navigate between different admin features using the drawer menu

## API Integration

The admin panel integrates with the following API endpoints:

- `/auth/getAllusers` - Fetch all users
- `/auth/makeAdmin` - Grant admin privileges
- `/auth/revertAdmin` - Revoke admin privileges
- `/auth/deleteUser` - Delete user account
- `/product/create` - Create new product
- `/product/update` - Update product details
- `/product/delete` - Delete product
- `/order/allorders` - Fetch all orders
- `/order/status` - Update order status

## Best Practices

1. Always validate user input before submission
2. Handle image uploads efficiently
3. Implement proper error handling
4. Maintain consistent UI/UX across all admin screens
5. Follow React Native performance guidelines

## Error Handling

- Form validation errors
- API request failures
- Image upload issues
- Network connectivity problems

## Future Improvements

1. Bulk actions for products and orders
2. Advanced filtering and search
3. Analytics dashboard
4. Export functionality for reports
5. Enhanced user role management

## Support

For any issues or questions regarding the admin panel, please contact the development team.
