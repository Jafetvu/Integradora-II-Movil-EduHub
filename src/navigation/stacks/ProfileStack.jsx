import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Profile from "../../modules/home/screens/Profile";
import ProfileOptions from "../../modules/home/components/ProfileOptions";
import Certificates from "../../modules/home/screens/Certificates";

const Stack = createStackNavigator();

export default function ProfileStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen 
        name="Profile" 
        component={Profile} 
        initialParams={{ setIsLoggedIn }} // ✅ Pasamos setIsLoggedIn correctamente
        options={{ title: "Perfil", headerShown: false }} 
      />
      <Stack.Screen 
        name="ProfileOptions" 
        component={ProfileOptions} 
        options={{ title: "Opciones", headerShown: false }} 
      />
      <Stack.Screen 
        name="Certificates" 
        component={Certificates} 
        options={{ title: "Certificados", headerShown: false }} 
      />
    </Stack.Navigator>
  );
}
