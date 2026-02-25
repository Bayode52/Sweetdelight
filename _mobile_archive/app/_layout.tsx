import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import './global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        // Hide splash screen immediately as we're not loading custom fonts yet
        SplashScreen.hideAsync();
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}
