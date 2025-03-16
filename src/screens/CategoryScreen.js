import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { SIZES } from '../constants/theme';

const CategoryScreen = ({ route, navigation }) => {
    const { category } = route.params;
    const { allProduct, isLoading } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);

    // Use colors directly from context or fallback to DEFAULT_COLORS
    const COLORS = colors || DEFAULT_COLORS;

    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortOption, setSortOption] = useState('default');

    useEffect(() => {
        if (allProduct && allProduct.length > 0) {
            const filtered = allProduct.filter(product =>
                product.category.toLowerCase() === category.toLowerCase()
            );
            sortProducts(filtered, sortOption);
        }
    }, [allProduct, category, sortOption]);

    const sortProducts = (products, option) => {
        let sorted = [...products];

        switch (option) {
            case 'price-low':
                sorted.sort((a, b) => a.new_price - b.new_price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.new_price - a.new_price);
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                // Default sorting (newest first or by id)
                break;
        }

        setFilteredProducts(sorted);
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: COLORS.background }]}>
            <Header title={`${category} Products`} />

            <View style={[styles.sortContainer, { backgroundColor: COLORS.white }]}>
                <Text style={[styles.sortLabel, { color: COLORS.secondary }]}>Sort by:</Text>
                <View style={styles.sortOptions}>
                    <TouchableOpacity
                        style={[
                            styles.sortOption,
                            sortOption === 'default' && [styles.activeSortOption, { borderColor: COLORS.primary }]
                        ]}
                        onPress={() => setSortOption('default')}
                    >
                        <Text
                            style={[
                                styles.sortOptionText,
                                sortOption === 'default' && { color: COLORS.primary }
                            ]}
                        >
                            Default
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sortOption,
                            sortOption === 'price-low' && [styles.activeSortOption, { borderColor: COLORS.primary }]
                        ]}
                        onPress={() => setSortOption('price-low')}
                    >
                        <Text
                            style={[
                                styles.sortOptionText,
                                sortOption === 'price-low' && { color: COLORS.primary }
                            ]}
                        >
                            Price: Low to High
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sortOption,
                            sortOption === 'price-high' && [styles.activeSortOption, { borderColor: COLORS.primary }]
                        ]}
                        onPress={() => setSortOption('price-high')}
                    >
                        <Text
                            style={[
                                styles.sortOptionText,
                                sortOption === 'price-high' && { color: COLORS.primary }
                            ]}
                        >
                            Price: High to Low
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {filteredProducts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: COLORS.secondary }]}>
                        No products found in this category.
                    </Text>
                    <TouchableOpacity
                        style={[styles.shopButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => navigation.navigate('Shop')}
                    >
                        <Text style={[styles.shopButtonText, { color: COLORS.white }]}>
                            Browse All Products
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={({ item }) => <ProductCard product={item} />}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.productList}
                    columnWrapperStyle={styles.columnWrapper}
                />
            )}
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
    },
    sortContainer: {
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    sortLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sortOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    sortOption: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 8,
        marginBottom: 8,
    },
    activeSortOption: {
        borderWidth: 1,
    },
    sortOptionText: {
        fontSize: 12,
    },
    productList: {
        padding: SIZES.padding,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    shopButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    shopButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CategoryScreen; 