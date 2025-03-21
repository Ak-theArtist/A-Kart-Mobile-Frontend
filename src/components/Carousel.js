import React, { useState, useRef, useContext } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Text
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const Carousel = ({ data }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const { colors, isDarkMode } = useContext(ThemeContext);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.slideContainer}
        >
            <View style={[
                styles.slide,
                {
                    backgroundColor: colors.white,
                    shadowColor: isDarkMode ? '#000' : '#000',
                    shadowOpacity: isDarkMode ? 0.4 : 0.25
                }
            ]}>
                <Image
                    source={item.image}
                    style={styles.image}
                    resizeMode="cover"
                />
                {item.title && (
                    <View style={[
                        styles.badgeContainer,
                        {
                            backgroundColor: isDarkMode
                                ? 'rgba(42, 116, 226, 0.92)'
                                : 'rgba(9, 64, 147, 0.92)'
                        }
                    ]}>
                        <Text style={styles.badgeText}>{item.title}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / screenWidth);
        setCurrentIndex(index);
    };

    // Auto scroll
    React.useEffect(() => {
        const timer = setInterval(() => {
            if (!flatListRef.current) return;

            if (currentIndex < data.length - 1) {
                flatListRef.current.scrollToIndex({
                    index: currentIndex + 1,
                    animated: true
                });
            } else {
                flatListRef.current.scrollToIndex({
                    index: 0,
                    animated: true
                });
            }
        }, 3000);

        return () => clearInterval(timer);
    }, [currentIndex]);

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            />
            <View style={styles.indicatorContainer}>
                {data.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            {
                                backgroundColor: currentIndex === index ? '#fff' : 'rgba(255, 255, 255, 0.5)'
                            }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        bottom: -15,
        width: screenWidth,
        height: 200,
    },
    slideContainer: {
        width: screenWidth,
        height: 200,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    slide: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badgeContainer: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    badgeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    }
});

export default Carousel; 