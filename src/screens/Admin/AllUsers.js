import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Card, Text, Badge, Button, Avatar } from 'react-native-paper';
import { ThemeContext } from '../../context/ThemeContext';
import { ShopContext } from '../../context/ShopContext';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import AdminHeader from '../../components/AdminHeader';

const AllUsers = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { users, updateUserRole, deleteUser } = useContext(ShopContext);
  const { user: currentUser } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  // Check if current user is the main admin
  const isMainAdmin = currentUser?.email === 'kumarakash91384@gmail.com';

  const handleRoleUpdate = async (userId, newRole) => {
    if (!isMainAdmin) {
      Alert.alert('Access Denied', 'Only the main administrator can modify user roles.');
      return;
    }

    try {
      await updateUserRole(userId, newRole);
      Alert.alert('Success', 'User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isMainAdmin) {
      Alert.alert('Access Denied', 'Only the main administrator can delete users.');
      return;
    }

    // Prevent deletion of main admin account
    const userToDelete = users.find(u => u._id === userId);
    if (userToDelete?.email === 'kumarakash91384@gmail.com') {
      Alert.alert('Error', 'Cannot delete the main administrator account');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? COLORS.darkGray : COLORS.white,
          shadowColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
      ]}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.userRow}>
          <View style={styles.userInfo}>
            <Avatar.Text
              size={50}
              label={item.name ? item.name.substring(0, 2).toUpperCase() : 'U'}
              backgroundColor={COLORS.primary}
              color={COLORS.white}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                {item.name || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: isDarkMode ? COLORS.gray : COLORS.darkGray }]}>
                {item.email || 'No email'}
              </Text>
            </View>
          </View>

          <View style={styles.roleContainer}>
            <Badge
              style={[
                styles.roleBadge,
                {
                  backgroundColor: item.role === 'admin' ? COLORS.primary : COLORS.darkGray,
                }
              ]}
            >
              {item.role || 'user'}
            </Badge>
          </View>

          {isMainAdmin && item.email !== 'kumarakash91384@gmail.com' && (
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => handleRoleUpdate(item._id, item.role === 'admin' ? 'user' : 'admin')}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: COLORS.primary
                  }
                ]}
              >
                <Text style={styles.buttonLabel}>
                  {item.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteUser(item._id)}
                style={styles.deleteButton}
              >
                <MaterialIcons name="delete-outline" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }]}>
      <AdminHeader title="Manage Users" />
      {!isMainAdmin && (
        <View style={[
          styles.warningBanner,
          { borderColor: isDarkMode ? 'rgba(255, 193, 7, 0.3)' : '#FFE69C' }
        ]}>
          <Text style={styles.warningText}>
            Note: Only the main administrator can modify user roles and delete users.
          </Text>
        </View>
      )}
      {users && users.length > 0 ? (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            // Add your refresh logic here
            setRefreshing(false);
          }}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDarkMode ? COLORS.white : COLORS.secondary }]}>
            No users found.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  warningBanner: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  warningText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardContent: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'column',
    gap: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  userDetails: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  joinedDate: {
    fontSize: 12,
    opacity: 0.8,
  },
  roleContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  roleBadge: {
    fontSize: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  buttonLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(244,67,54,0.1)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AllUsers; 