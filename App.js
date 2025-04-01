import React, { useState, useEffect } from "react";
import { StyleSheet, LogBox } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navigation from "./src/navigation/Navigation";
import NavigationLogger from "./src/navigation/NavigationLogger";
import Loading from "./src/kernel/components/Loading";
import SessionExpiredModal from "./src/kernel/components/SessionExpiredModal";
import { checkTokenExpiration } from "./src/config/authService";
LogBox.ignoreAllLogs(false); // Reactiva todos los logs

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpiredModalVisible, setIsSessionExpiredModalVisible] = useState(false);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log("Token obtenido en App.js:", token);

      if (token) {
        const isTokenValid = await checkTokenExpiration();

        if (isTokenValid) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setIsSessionExpiredModalVisible(true);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error al obtener el token:", error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  const handleCloseSessionExpiredModal = () => {
    setIsSessionExpiredModalVisible(false);
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return <Loading isVisible={true} size={64} color="#AA39AD" title="Espere un momento" />;
  } else {
    return (
      <>
        {isLoggedIn ? (
          <NavigationLogger setIsLoggedIn={setIsLoggedIn} />
        ) : (
          <Navigation setIsLoggedIn={setIsLoggedIn} />
        )}
        <SessionExpiredModal
          isVisible={isSessionExpiredModalVisible}
          onClose={handleCloseSessionExpiredModal}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

