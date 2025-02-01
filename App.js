import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

import ClimateChangeScreen from './screens/ClimateChangeScreen';
import SolutionsScreen from './screens/SolutionsScreen';
import TodayData from './screens/TodayData';
import ClimateData from './screens/ClimateData';
import AIScreen from './screens/AIScreen';

const Stack = createStackNavigator();

export default function App() {
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      // Request Location Permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert("Permission Required", "Location access is required for fetching climate data.");
      } else {
        setLocationGranted(true);
      }

      // Request Notification Permissions
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        Alert.alert("Permission Required", "Notification access is needed to alert you about climate updates.");
      } else {
        setNotificationGranted(true);
      }
    };

    requestPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ClimateChange">
        <Stack.Screen 
          name="ClimateChange" 
          component={ClimateChangeScreen} 
          options={{ title: 'Climate Change Overview' }}
        />
        <Stack.Screen 
          name="Solutions" 
          component={SolutionsScreen} 
          options={{ title: 'Solutions to Climate Change' }}
        />
        <Stack.Screen 
          name="TodayData" 
          component={TodayData} 
          options={{ title: 'Today’s Climate Data' }}
        />
        <Stack.Screen 
          name="ClimateData" 
          component={ClimateData} 
          options={{ title: 'Historical Climate Data' }}
        />
        <Stack.Screen 
          name="AIScreen" 
          component={AIScreen} 
          options={{ title: 'AI Chat Assistant' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
