import React, { useState, useRef, useContext } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const SmallCarousel = ({ data, height = 120 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const { colors, isDarkMode } = useContext(ThemeContext);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.slideContainer, { height }]}
        >
            <View style={[
                styles.slide,
                {
                    backgroundColor: colors.white,
                    height: height - 20,
                    shadowColor: isDarkMode ? '#000' : '#000',
                    shadowOpacity: isDarkMode ? 0.4 : 0.25
                }
            ]}>
                <Image
                    source={item.image}
                    style={styles.image}
                    resizeMode="cover"
                />
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
        <View style={[styles.container, { height }]}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: screenWidth
    },
    slideContainer: {
        width: screenWidth,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    slide: {
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    image: {
        width: '100%',
        height: '100%',
    }
});

export default SmallCarousel; 