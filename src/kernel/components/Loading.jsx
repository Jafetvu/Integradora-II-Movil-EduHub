import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

export default function Loading(props) {
  const { title, size, color } = props;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size={size} color={color} />
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute", // Posición absoluta para cubrir toda la pantalla
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center", // Centra verticalmente
    alignItems: "center", // Centra horizontalmente
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
  },
  container: {
    width: 350, // Ancho del contenedor interno
    height: 250, // Alto del contenedor interno
    backgroundColor: "white", // Fondo blanco
    borderRadius: 10, // Bordes redondeados
    justifyContent: "center", // Centra verticalmente
    alignItems: "center", // Centra horizontalmente
  },
  title: {
    color: "black",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 10, // Espacio entre el ActivityIndicator y el texto
  },
});