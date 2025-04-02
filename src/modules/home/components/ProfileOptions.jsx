import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const ProfileOptions = ({ onEditPassword, navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recursos</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.square} onPress={onEditPassword}>
          <Icon name="lock" size={32} color="#AA39AD" />
          <Text style={styles.optionText}>Editar Contraseña</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.square} onPress={() => navigation.navigate("Certificates")}>
          <Icon name="assignment" size={32} color="#AA39AD" />
          <Text style={styles.optionText}>Certificados</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#AA39AD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#AA39AD",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  square: {
    width: (width - 80) / 2,
    aspectRatio: 1,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#333",
  },
});

export default ProfileOptions;
