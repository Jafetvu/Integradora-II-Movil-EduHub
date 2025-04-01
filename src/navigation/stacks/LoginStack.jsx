import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../../modules/auth/screens/Login";
import CreateAccountStack from "./CreateAccountStack";
import ForgotPasswordStack from "./ForgotPasswordStack";
const Stack = createStackNavigator();
export default function LoginStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" options={{headerShown: false}}>
        {(props) => <Login {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccountStack}
        options={{ title: "Crear cuenta", headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordStack}
        options={{ title: "Recuperar contraseña", headerShown: false }}
      />
    </Stack.Navigator>
  );
}
