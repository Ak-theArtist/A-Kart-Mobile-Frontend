import React, { useState, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Text
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const Carousel = ({ data }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.slideContainer}
        >
            <View style={styles.slide}>
                <Image
                    source={item.image}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
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
        backgroundColor: '#fff',
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
    textContainer: {
        position: 'absolute',
        bottom: 5,
        padding: 15,

    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: 'fit-content',
        borderRadius: 10,
        padding: 10,
        textAlign: 'center',
    },
    description: {
        color: '#fff',
        fontSize: 14,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        elevation: 10,
        textShadowRadius: 3,
        marginLeft: 8,
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