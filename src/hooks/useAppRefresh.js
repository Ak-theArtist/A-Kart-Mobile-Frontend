import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppRefresh = () => {

    const triggerAppRefresh = useCallback(async () => {
        try {
            console.log('Setting app refresh trigger...');
            await AsyncStorage.setItem('triggerAppRefresh', 'true');
        } catch (error) {
            console.error('Error setting refresh trigger:', error);
        }
    }, []);

    return {
        triggerAppRefresh
    };
};

export default useAppRefresh; 