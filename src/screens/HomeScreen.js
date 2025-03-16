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
    Animated,
    Platform,
    RefreshControl,
    Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShopContext } from '../context/ShopContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { SIZES } from '../constants/theme';

const ProductSkeleton = () => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[styles.skeletonContainer, { opacity: pulseAnim }]} />
    );
};

const HomeScreen = ({ navigation }) => {
    const { allProduct, fetchProducts } = useContext(ShopContext);
    const { colors } = useContext(ThemeContext);
    const scrollY = new Animated.Value(0);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const searchButtonAnim = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchProducts();
        } catch (error) {
            console.error('Error refreshing products:', error);
        }
        setRefreshing(false);
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await fetchProducts();
            } catch (error) {
                console.error('Error loading products:', error);
            }
            setLoading(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        };
        loadData();
    }, []);

    // Featured products (first 4 products)
    const featuredProducts = allProduct && allProduct.length > 0 ? allProduct.slice(0, 4) : [];

    // New arrivals (last 4 products)
    const newArrivals = allProduct && allProduct.length > 0 ? allProduct.slice(-4) : [];

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
            title: 'Summer Sale',
            description: 'Up to 50% off on all products',
        },
        {
            id: '2',
            image: require('../../public/assets/Banner2.jpeg'),
            title: 'New Arrivals',
            description: 'Check out our latest products',
        },
        {
            id: '3',
            image: require('../../public/assets/Banner3.jpg'),
            title: 'Buy One Get One',
            description: 'Buy one get one free',
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
        <TouchableOpacity
            style={[
                styles.productCardContainer,
                {
                    transform: [{
                        scale: scrollY.interpolate({
                            inputRange: [0, 100],
                            outputRange: [1, 0.95],
                            extrapolate: 'clamp',
                        })
                    }],
                    opacity: fadeAnim,
                }
            ]}
            onPress={() => navigation.navigate('Product', { product: item })}
            activeOpacity={0.8}
        >
            <ProductCard product={item} />
        </TouchableOpacity>
    );

    const renderProductSection = (title, products, category) => {
        if (loading) {
            return (
                <View style={styles.sectionContainer}>
                    {renderSectionHeader(title, () => { })}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {[1, 2, 3, 4].map((_, index) => (
                            <ProductSkeleton key={index} />
                        ))}
                    </ScrollView>
                </View>
            );
        }

        if (!products || products.length === 0) return null;

        return (
            <View style={styles.sectionContainer}>
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

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: true,
            listener: ({ nativeEvent }) => {
                const currentScrollY = nativeEvent.contentOffset.y;
                if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                    // Scrolling down - hide button
                    Animated.spring(searchButtonAnim, {
                        toValue: 1,
                        useNativeDriver: true,
                    }).start();
                } else {
                    // Scrolling up - show button
                    Animated.spring(searchButtonAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
                lastScrollY.current = currentScrollY;
            }
        }
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="A-Kart" />
            <Animated.ScrollView
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
                {renderProductSection("New Arrivals", newArrivals, 'all')}

                {/* Footer */}
                <Footer />
            </Animated.ScrollView>

            {/* Floating Search Button */}
            <Animated.View
                style={[
                    styles.floatingButton,
                    {
                        transform: [
                            {
                                translateY: searchButtonAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 100]
                                })
                            }
                        ]
                    }
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.searchButton,
                        { backgroundColor: colors.primary }
                    ]}
                    onPress={() => navigation.navigate('Contact')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="information-circle" size={24} color="white" />
                </TouchableOpacity>
            </Animated.View>
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
    sectionContainer: {
        marginVertical: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    productsList: {
        paddingHorizontal: 10,
        paddingBottom: 5,
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
        margin: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
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