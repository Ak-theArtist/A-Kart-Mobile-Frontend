import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert
} from 'react-native';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { SIZES } from '../constants/theme';

const ShopScreen = ({ navigation, route }) => {
    const { allProduct, isLoading, error, fetchProducts } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);

    // Get category from route params if available
    const categoryFromRoute = route.params?.category;
    const [selectedCategory, setSelectedCategory] = useState(categoryFromRoute || 'all');
    const [localLoading, setLocalLoading] = useState(false);

    // Update selected category when route params change
    useEffect(() => {
        if (categoryFromRoute) {
            console.log('Setting category from route params:', categoryFromRoute);
            setSelectedCategory(categoryFromRoute);
        }
    }, [categoryFromRoute]);

    // Reset category when navigating to this screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // If there's a category in the route params, use it
            if (route.params?.category) {
                console.log('Focus event - Setting category:', route.params.category);
                setSelectedCategory(route.params.category);
            }
        });

        return unsubscribe;
    }, [navigation, route.params]);

    const handleRetry = async () => {
        setLocalLoading(true);
        try {
            await fetchProducts();
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch products. Please try again.');
        } finally {
            setLocalLoading(false);
        }
    };

    const categories = [
        { id: 'all', name: 'All' },
        { id: 'men', name: "Men's" },
        { id: 'women', name: "Women's" },
        { id: 'kids', name: "Kid's" }
    ];

    const filteredProducts = selectedCategory === 'all'
        ? allProduct
        : allProduct?.filter(product => product.category === selectedCategory);

    if (isLoading || localLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.secondary }]}>Loading products...</Text>
                <Text style={[styles.loadingSubtext, { color: colors.gray }]}>This may take a moment if the server is starting up</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Shop" />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.secondary }]}>
                        Oops! Something went wrong.
                    </Text>
                    <Text style={[styles.errorSubtext, { color: colors.gray }]}>
                        {error.message || 'Failed to load products. Please try again.'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: colors.primary }]}
                        onPress={handleRetry}
                    >
                        <Text style={[styles.retryButtonText, { color: colors.white }]}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Shop" />

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
                style={{ backgroundColor: colors.background }}
            >
                {categories.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.categoryButton,
                            {
                                backgroundColor: selectedCategory === item.id ? colors.primary : colors.white,
                                borderColor: colors.primary,
                                borderWidth: selectedCategory === item.id ? 2 : 1.5
                            }
                        ]}
                        onPress={() => setSelectedCategory(item.id)}
                    >
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === item.id
                                ? { color: colors.white }
                                : { color: colors.primary }
                        ]}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <FlatList
                data={filteredProducts}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onPress={() => navigation.navigate('Product', { product: item })}
                    />
                )}
                keyExtractor={item => (item._id || item.id || Math.random().toString()).toString()}
                numColumns={2}
                contentContainerStyle={styles.productsContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.secondary }]}>
                            No products found in this category.
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    loadingSubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    categoriesContainer: {
        flex: 1,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
    },
    categoryButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        marginRight: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    categoryText: {
        fontWeight: 'bold',
        fontSize: 16,
        textShadowRadius: 1,
    },
    productsContainer: {
        // marginTop: 20,
        padding: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    errorSubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default ShopScreen; 