import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Asegúrate de instalar esta librería

const { width } = Dimensions.get('window');

const ProfileOptions = ({onEditPassword, navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recursos</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.square} onPress={onEditPassword}>
          <Icon name="password" size={32} color="#6200ee" />
          <Text style={styles.optionText}>EDITAR CONTRASEÑA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.square} onPress={() => navigation.navigate("Certificates")}>
          <Icon name="assignment" size={32} color="#6200ee" />
          <Text style={styles.optionText}>CERTIFICADOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16, // Reduje el espacio antes de los botones
  },
  row: {
    flexDirection: "row",
    justifyContent: "center", // Centra los botones en la fila
    gap: 12, // Espaciado entre los botones (más juntos)
  },
  square: {
    width: (width - 80) / 2, // Ajusté el tamaño para que se vean bien juntos
    aspectRatio: 1, // Mantiene la proporción cuadrada
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 14,
    marginTop: 6, // Espacio más reducido entre el icono y el texto
    textAlign: "center",
  },
});


export default ProfileOptions;