import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import AlertItem from "../components/AlertItem";
import { getUserNotifications } from "../../../config/authService";

const Alerts = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        setIsLoading(true);
        const data = await getUserNotifications();
        setNotificaciones(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificaciones();
  }, []);

  // Separa notificaciones en leídas y no leídas
  const notificacionesNoLeidas = notificaciones.filter((item) => !item.leida);
  const notificacionesLeidas = notificaciones.filter((item) => item.leida);

  return (
    <ScrollView style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color="#AA39AD" />}
      
      {/* Sección de notificaciones no leídas */}
      <View style={styles.seccionHeader}>
        <Text style={styles.seccionTitulo}>No leídas</Text>
        <Text style={styles.contador}>({notificacionesNoLeidas.length})</Text>
      </View>
      {notificacionesNoLeidas.map((notificacion) => (
        <AlertItem
          key={notificacion.id}
          titulo={notificacion.titulo}
          descripcionAccion={notificacion.descripcionAccion}
          fecha={notificacion.fecha}
          imagen={notificacion.imagen}
          leida={notificacion.leida}
        />
      ))}

      {/* Sección de notificaciones leídas */}
      <Text style={styles.seccionTitulo}>Leídas</Text>
      {notificacionesLeidas.map((notificacion) => (
        <AlertItem
          key={notificacion.id}
          titulo={notificacion.titulo}
          descripcionAccion={notificacion.descripcionAccion}
          fecha={notificacion.fecha}
          imagen={notificacion.imagen}
          leida={notificacion.leida}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 16,
  },
  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  contador: {
    fontSize: 18,
    color: "#666",
  },
  buttonLogin: {
    width: "60%",
    marginTop: 10,
    backgroundColor: "#AA39AD",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Alerts;
