import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import CreateAccount from "../../modules/auth/screens/CreateAccount";
import ContinueCreate from "../../modules/auth/screens/ContinueCreate";
const Stack = createStackNavigator(); 
export default function CreateAccountStack() {
  return (
    <Stack.Navigator  initialRouteName='CreateAccount'>
      <Stack.Screen name="CreateAccount" component={CreateAccount} options={{title:"Crear cuenta", headerShown: false}}/>
      <Stack.Screen name="ContinueCreate" component={ContinueCreate} options={{title:"Ya casi creada tu cuenta", headerShown: false}} />
    </Stack.Navigator>
  )
}