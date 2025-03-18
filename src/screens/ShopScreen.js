import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    useWindowDimensions
} from 'react-native';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { SIZES } from '../constants/theme';

const ShopScreen = ({ navigation, route }) => {
    const { allProduct, isLoading, error, fetchProducts } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

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

    // Sort products to show latest first (assuming newer products have higher IDs or more recent createdAt dates)
    const sortProductsByLatest = (products) => {
        if (!products) return [];

        return [...products].sort((a, b) => {
            // If products have createdAt field, use that for sorting
            if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }

            // If products have _id that looks like MongoDB ObjectId (which contains timestamp)
            // More recent ObjectIds will be "greater" when compared as strings
            if (a._id && b._id) {
                return b._id.localeCompare(a._id);
            }

            // Fallback to regular id if available
            if (a.id && b.id) {
                return b.id - a.id;
            }

            // If no sortable fields, maintain original order
            return 0;
        });
    };

    // Filter and sort products
    const getFilteredAndSortedProducts = () => {
        let filtered = selectedCategory === 'all'
            ? allProduct
            : allProduct?.filter(product => product.category === selectedCategory);

        return sortProductsByLatest(filtered);
    };

    const filteredProducts = getFilteredAndSortedProducts();

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

            <View style={[styles.categoriesWrapper, { backgroundColor: colors.background }]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.categoriesContainer, { paddingHorizontal: 10 }]}
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
                                    borderWidth: selectedCategory === item.id ? 2 : 1.5,
                                    minWidth: width / 6,
                                    paddingHorizontal: width < 350 ? 12 : 20,
                                }
                            ]}
                            onPress={() => setSelectedCategory(item.id)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === item.id
                                    ? { color: colors.white }
                                    : { color: colors.primary },
                                { fontSize: width < 350 ? 14 : 16 }
                            ]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredProducts}
                renderItem={({ item }) => (
                    <View style={[
                        styles.productCardWrapper,
                        {
                            width: (width - 48) / 2,
                            maxWidth: 170
                        }
                    ]}>
                        <ProductCard
                            product={item}
                            onPress={() => navigation.navigate('Product', { product: item })}
                        />
                    </View>
                )}
                keyExtractor={item => (item._id || item.id || Math.random().toString()).toString()}
                numColumns={2}
                contentContainerStyle={styles.productsContainer}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.columnWrapper}
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
    categoriesWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoriesContainer: {
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 70,
    },
    categoryButton: {
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryText: {
        fontWeight: 'bold',
        textShadowRadius: 0.5,
    },
    productsContainer: {
        padding: 12,
        alignItems: 'center',
    },
    productCardWrapper: {
        margin: 6,
        alignItems: 'center',
    },
    columnWrapper: {
        justifyContent: 'center',
        marginHorizontal: 6,
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