import React from 'react';
import {
    View,
    Modal,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    useWindowDimensions,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AvatarSelectionModal = ({ visible, onClose, onSelectAvatar, colors }) => {
    // Get dynamic screen dimensions
    const { width, height } = useWindowDimensions();

    // Calculate responsive sizes
    const isSmallDevice = width < 350;
    const modalWidth = Math.min(width * 0.9, 400);
    const iconSize = isSmallDevice ? 35 : 40;
    const fontSize = {
        title: isSmallDevice ? 16 : 18,
        note: isSmallDevice ? 11 : 12
    };

    // Avatar options
    const avatars = [
        { id: 'default', source: null, name: 'Default' },
        { id: 'goku', source: require('../../public/assets/profile-pics/goku.jpg'), name: 'Goku' },
        { id: 'naruto', source: require('../../public/assets/profile-pics/naruto.jpg'), name: 'Naruto' },
        { id: 'eren', source: require('../../public/assets/profile-pics/eren.jpg'), name: 'Eren' },
    ];

    // Calculate number of columns based on screen width
    const numColumns = width > 500 ? 3 : 2;

    const renderAvatarItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.avatarItem,
                {
                    borderColor: colors.lightGray,
                    margin: isSmallDevice ? 6 : 10,
                    padding: isSmallDevice ? 6 : 8
                }
            ]}
            onPress={() => {
                onSelectAvatar(item);
                onClose();
            }}
        >
            {item.source ? (
                <Image source={item.source} style={styles.avatarImage} />
            ) : (
                <View style={[styles.defaultAvatar, { backgroundColor: colors.primary }]}>
                    <Ionicons name="person" size={iconSize} color={colors.white} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.centeredView, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View
                    style={[
                        styles.modalView,
                        {
                            backgroundColor: colors.white,
                            width: modalWidth,
                            maxHeight: height * 0.8,
                            padding: isSmallDevice ? 15 : 20
                        }
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <Text
                            style={[
                                styles.modalTitle,
                                {
                                    color: colors.secondary,
                                    fontSize: fontSize.title
                                }
                            ]}
                        >
                            Choose Avatar
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={isSmallDevice ? 22 : 24} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={avatars}
                        renderItem={renderAvatarItem}
                        keyExtractor={item => item.id}
                        numColumns={numColumns}
                        contentContainerStyle={styles.avatarGrid}
                    />

                    <Text
                        style={[
                            styles.note,
                            {
                                color: colors.gray,
                                fontSize: fontSize.note,
                                marginTop: isSmallDevice ? 10 : 15
                            }
                        ]}
                    >
                        Note: Profile photos will reset when you log out
                    </Text>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    avatarGrid: {
        paddingVertical: 10,
    },
    avatarItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 12,
        aspectRatio: 1,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    defaultAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    note: {
        textAlign: 'center',
        fontStyle: 'italic',
    }
});

export default AvatarSelectionModal; 