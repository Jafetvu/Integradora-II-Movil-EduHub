import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AlertItem from "../components/AlertItem";
import { logout } from "../../../config/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Alerts = () => {
  const [notificaciones, setNotificaciones] = useState([])
  

  // Simulación de carga de notificaciones desde una API
  useEffect(() => {
    const fetchNotificaciones = async () => {
      const data = [
        {
          id: "1",
          titulo: "Nuevo mensaje",
          descripcionAccion:
            "Contenido nuevo disponible en tu curso de React Native.",
          fecha: "12/02/2025",
          imagen:
            "https://imgs.search.brave.com/IGFSbyDfXZYHhzUlPo48CB_oPTSFAf39MdEyP0Fxj-M/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvZmVhdHVy/ZWQvbWVzc2ktcGlj/dHVyZXMtanp5a2Y4/NHNhdzZ3YmtkNi5q/cGc", // URL de la imagen
          leida: false,
        },
        {
          id: "2",
          titulo: "Certificado obtenido",
          descripcionAccion:
            "Has obtenido un certificado en el curso de JavaScript.",
          fecha: "11/02/2025",
          imagen: "https://via.placeholder.com/50", // URL de la imagen
          leida: true,
        },
        {
          id: "3",
          titulo: "Recordatorio",
          descripcionAccion: "No olvides completar tu perfil.",
          fecha: "10/02/2025",
          imagen: "https://via.placeholder.com/50", // URL de la imagen
          leida: false,
        },
      ];
      setNotificaciones(data);
    };

    fetchNotificaciones();
  }, []);

  // Separar notificaciones en leídas y no leídas
  const notificacionesNoLeidas = notificaciones.filter((item) => !item.leida);
  const notificacionesLeidas = notificaciones.filter((item) => item.leida);

  return (
    <ScrollView style={styles.container}>
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
    marginTop: 16, // Margen superior
  },
  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8, // Espacio entre el título y el contador
  },
  contador: {
    fontSize: 18,
    color: "#666",
  },
  
  buttonLogin: {
    width: "60%", // Tamaño reducido
    marginTop: 10,
    backgroundColor: "#AA39AD",
    paddingVertical: 12, // Ajusta la altura
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    alignSelf: "center", // ✅ CENTRA EL BOTÓN DENTRO DE SU CONTENEDOR
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
export default Alerts;
