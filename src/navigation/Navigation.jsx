import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from "@rneui/base";
import LoginStack from "./stacks/LoginStack";
import CreateAccountStack from "./stacks/CreateAccountStack";
import ForgotPasswordStack from "./stacks/ForgotPasswordStack";

const Tab = createBottomTabNavigator();

export default function Navigation({ setIsLoggedIn }) {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const { iconName, iconType } = getIconName(route.name, focused);
          return (
            <Icon name={iconName} type={iconType} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#180A2E",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}>
        {/* Pasa setIsLoggedIn a LoginStack */}
        <Tab.Screen name="Login">
          {(props) => <LoginStack {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Tab.Screen>
        <Tab.Screen name="CreateAccount" component={CreateAccountStack} options={{ title: 'Crear Cuenta' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const getIconName = (routeName, focused) => {
  let iconName = "";
  const iconType = "material-community";

  switch (routeName) {
    case "Login":
      iconName = focused ? "account" : "account-outline";
      break;
    case "CreateAccount":
      iconName = focused ? "account-plus" : "account-plus-outline";
      break;
  }

  return { iconName, iconType };
};