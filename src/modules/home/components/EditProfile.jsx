import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Input, Button } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { updateUser } from "../../../config/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditProfile = ({ onClose, userData, onUpdate, setIsLoggedIn }) => {
  const [username, setUsername] = useState(userData.username || "");
  const [nombre, setNombre] = useState(userData.name || "");
  const [apellidos, setApellidos] = useState(`${userData.surname} ${userData.lastname}` || "");
  const [correo, setCorreo] = useState(userData.email || "");
  const [descripcion, setDescripcion] = useState(userData.description || "");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isCredentialsChanged, setIsCredentialsChanged] = useState(false);

  useEffect(() => {
    const fields = [username, nombre, apellidos, correo, descripcion];
    const isAnyFieldEmpty = fields.some((field) => field.trim() === "");
    setIsButtonDisabled(isAnyFieldEmpty);

    if (username !== userData.username || correo !== userData.email) {
      setIsCredentialsChanged(true);
    } else {
      setIsCredentialsChanged(false);
    }
  }, [username, nombre, apellidos, correo, descripcion]);

  const handleSubmit = async () => {
    try {
      const [surname, lastname] = apellidos.split(" ");
      const updatedData = {
        username,
        name: nombre,
        surname,
        lastname,
        email: correo,
        description: descripcion,
      };

      const userId = await AsyncStorage.getItem("userId");
      await updateUser(userId, updatedData);
      Alert.alert("Éxito", "Perfil actualizado correctamente");

      if (isCredentialsChanged) {
        Alert.alert("Aviso", "Has cambiado tu username o correo. Deberás iniciar sesión nuevamente.");
        await AsyncStorage.removeItem("authToken");
        setIsLoggedIn(false); // Actualiza el estado de autenticación
      }

      onClose();
      onUpdate(updatedData);
    } catch (error) {
      Alert.alert("Error", error.message);
      console.error("Error al actualizar el perfil:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#AA39AD" />
      </TouchableOpacity>
      <View style={styles.container2}>
        <Input
          placeholder={userData.username || "Ingresa tu username"}
          value={username}
          onChangeText={setUsername}
          label="Username"
          labelStyle={styles.label}
          inputStyle={styles.value}
          containerStyle={styles.field}
        />
        <Input
          placeholder={userData.name || "Ingresa tu nombre"}
          value={nombre}
          onChangeText={setNombre}
          label="Nombre"
          labelStyle={styles.label}
          inputStyle={styles.value}
          containerStyle={styles.field}
        />
        <Input
          placeholder={`${userData.surname} ${userData.lastname}` || "Ingresa tus apellidos"}
          value={apellidos}
          onChangeText={setApellidos}
          label="Apellidos"
          labelStyle={styles.label}
          inputStyle={styles.value}
          containerStyle={styles.field}
        />
        <Input
          placeholder={userData.email || "Ingresa tu correo electrónico"}
          value={correo}
          onChangeText={setCorreo}
          label="Correo Electrónico"
          labelStyle={styles.label}
          inputStyle={styles.value}
          containerStyle={styles.field}
          keyboardType="email-address"
        />
        <Input
          placeholder={userData.description || "Ingresa una descripción"}
          value={descripcion}
          onChangeText={setDescripcion}
          label="Descripción"
          labelStyle={styles.label}
          inputStyle={styles.value}
          containerStyle={styles.field}
          multiline
        />
        <Button
          title="Actualizar Información"
          onPress={handleSubmit}
          buttonStyle={styles.buttonLogin}
          titleStyle={styles.buttonText}
          disabled={isButtonDisabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "90%",
    padding: 16,
  },
  container2: {
    padding: 16,
    backgroundColor: "white",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonLogin: {
    backgroundColor: "#AA39AD",
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

export default EditProfile;