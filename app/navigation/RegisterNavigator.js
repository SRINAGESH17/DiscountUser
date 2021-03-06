import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Register from '../screens/Register/Register';
import MainVerification from '../screens/MainVerification';

import DrawerNavigator from './DrawerNavigator';
import BottomNavigator from './BottomNavigator';
import RatingReview from '../screens/Home/RatingReview';

const Stack = createStackNavigator();

const RegisterNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, presentation: 'modal'}}
      initialRouteName="Drawer">
      {/* <Stack.Screen name="Main" component={MainVerification} /> */}
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen name="register" component={Register} />
      <Stack.Screen name="rating" component={RatingReview} />
    </Stack.Navigator>
  );
};

export default RegisterNavigator;
