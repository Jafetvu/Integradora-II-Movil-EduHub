import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import ForgotPassword from '../../modules/auth/screens/ForgotPassword';
import SecondForgotPassword from '../../modules/auth/screens/SecondForgotPassword';
import Login from "../../modules/auth/screens/Login";
const Stack = createStackNavigator(); 
export default function ForgotPasswordStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{title:"Recuperar contraseña"}} />
      <Stack.Screen name="SecondForgotPassword" component={SecondForgotPassword} options={{title:"Recuperar contraseña"}} />
    </Stack.Navigator>
  )
}