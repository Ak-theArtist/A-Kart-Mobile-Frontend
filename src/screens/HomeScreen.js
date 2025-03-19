import React, { useContext, useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    Pressable,
    useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import SmallCarousel from '../components/SmallCarousel';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { SIZES } from '../constants/theme';

const HomeScreen = ({ navigation }) => {
    const { allProduct, fetchProducts, refreshCart } = useContext(ShopContext);
    const { user } = useContext(AuthContext);
    const { colors, isDarkMode } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const lastScrollY = useRef(0);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchProducts();
            if (user) {
                await refreshCart();
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
        setRefreshing(false);
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await fetchProducts();
                if (user) {
                    // Ensure cart data is loaded when the screen loads
                    console.log('HomeScreen: Loading cart data for user');
                    await refreshCart();
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?._id]); // Re-fetch whenever the user changes

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

    // Featured products (first 4 products)
    const featuredProducts = allProduct && allProduct.length > 0 ? allProduct.slice(0, 4) : [];

    // New arrivals (latest 10 products)
    const newArrivals = allProduct && allProduct.length > 0
        ? sortProductsByLatest(allProduct).slice(0, 10)
        : [];

    // Men's products
    const mensProducts = allProduct && allProduct.length > 0
        ? allProduct.filter(product => product.category === 'men').slice(0, 4)
        : [];

    // Women's products
    const womensProducts = allProduct && allProduct.length > 0
        ? allProduct.filter(product => product.category === 'women').slice(0, 4)
        : [];

    // Kid's products
    const kidsProducts = allProduct && allProduct.length > 0
        ? allProduct.filter(product => product.category === 'kids').slice(0, 4)
        : [];

    // Carousel data
    const carouselData = [
        {
            id: '1',
            image: require('../../public/assets/Banner1.jpeg'),
            title: 'SUMMER SALE',
        },
        {
            id: '2',
            image: require('../../public/assets/Banner2.jpeg'),
            title: 'NEW ARRIVALS',
        },
        {
            id: '3',
            image: require('../../public/assets/Banner3.jpg'),
            title: 'BUY 1 GET 1',
        }
    ];

    // Second carousel data
    const secondCarouselData = [
        {
            id: '1',
            image: require('../../public/assets/Carousel2/banner_mens.png'),
        },
        {
            id: '2',
            image: require('../../public/assets/Carousel2/banner_women.png'),
        },
        {
            id: '3',
            image: require('../../public/assets/Carousel2/banner_kids.png'),
        }
    ];

    const renderSectionHeader = (title, onViewAll) => (
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <View style={styles.titleContainer}>
                <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                    {title}
                </Text>
                <View style={[styles.titleUnderline, { backgroundColor: colors.primary }]} />
            </View>
            <TouchableOpacity
                style={styles.viewAllButton}
                onPress={onViewAll}
            >
                <Text style={[styles.viewAllText, { color: colors.primary }]}>
                    View All
                </Text>
                <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colors.primary}
                    style={styles.viewAllIcon}
                />
            </TouchableOpacity>
        </View>
    );

    const renderProductItem = ({ item }) => (
        <View style={[styles.productCardContainer, { width: width * 0.42 }]}>
            <TouchableOpacity
                onPress={() => navigation.navigate('Product', { product: item })}
                activeOpacity={0.8}
                style={{ width: '100%' }}
            >
                <ProductCard product={item} />
            </TouchableOpacity>
        </View>
    );

    const renderProductSection = (title, products, category) => {
        if (loading) {
            return (
                <View style={[styles.sectionContainer, { backgroundColor: colors.white }]}>
                    {renderSectionHeader(title, () => { })}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {[1, 2, 3, 4].map((_, index) => (
                            <View key={index} style={[styles.skeletonContainer, { backgroundColor: colors.lightGray }]} />
                        ))}
                    </ScrollView>
                </View>
            );
        }

        if (!products || products.length === 0) return null;

        return (
            <View style={[styles.sectionContainer, { backgroundColor: colors.white }]}>
                {renderSectionHeader(title, () => navigation.navigate('Shop', { category }))}
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={item => (item._id || item.id || Math.random().toString()).toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.productsList}
                />
            </View>
        );
    };

    const handleScroll = ({ nativeEvent }) => {
        const currentScrollY = nativeEvent.contentOffset.y;
        lastScrollY.current = currentScrollY;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="A-Kart" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Carousel */}
                <View style={styles.carouselContainer}>
                    <Carousel data={carouselData} />
                </View>

                {/* Product Sections */}
                {renderProductSection("Men's Collection", mensProducts, 'men')}
                {renderProductSection("Women's Collection", womensProducts, 'women')}
                {renderProductSection("Kid's Collection", kidsProducts, 'kids')}
                {renderProductSection("Featured Products", featuredProducts, 'all')}

                {/* Second Carousel */}
                <View style={styles.smallCarouselContainer}>
                    <SmallCarousel data={secondCarouselData} height={120} />
                </View>

                {renderProductSection("New Arrivals", newArrivals, 'all')}

                {/* Footer */}
                <Footer />
            </ScrollView>

            {/* Floating Info Button */}
            <View style={styles.floatingButton}>
                <TouchableOpacity
                    style={[
                        styles.searchButton,
                        {
                            backgroundColor: isDarkMode
                                ? 'rgb(42, 116, 226)'  // Brighter blue for dark mode
                                : colors.primary
                        }
                    ]}
                    onPress={() => navigation.navigate('Contact')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="information-circle" size={24} color="#ffffff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    carouselContainer: {
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    smallCarouselContainer: {
        marginVertical: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    sectionContainer: {
        marginVertical: 15,
        paddingVertical: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 15,
        paddingVertical: 10,
    },
    titleContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    titleUnderline: {
        height: 2,
        width: 40,
        borderRadius: 1,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 5,
    },
    viewAllIcon: {
        marginTop: 1,
    },
    productCardContainer: {
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        overflow: 'hidden',
    },
    productsList: {
        paddingHorizontal: 8,
        paddingBottom: 5,
        paddingTop: 5,
    },
    productList: {
        paddingHorizontal: 10,
        paddingBottom: 5,
    },
    skeletonContainer: {
        width: 160,
        height: 220,
        backgroundColor: '#E1E9EE',
        borderRadius: 8,
        margin: 10
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    searchButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen; 