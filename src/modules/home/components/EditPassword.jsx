import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Input, Button } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { verifyPassword, updateUser } from "../../../config/authService"; // Importa los métodos verifyPassword y updateUser
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditPassword = ({ onClose, userEmail }) => {
  // Estados para los campos del formulario
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estado para deshabilitar el botón
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // Validar campos cada vez que cambien
  React.useEffect(() => {
    const fields = [currentPassword, newPassword, confirmPassword];
    const isAnyFieldEmpty = fields.some((field) => field.trim() === "");
    setIsButtonDisabled(isAnyFieldEmpty);
  }, [currentPassword, newPassword, confirmPassword]);

  // Función para manejar la actualización de la contraseña
  const handleUpdatePassword = async () => {
    // Validar que la nueva contraseña y la confirmación coincidan
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    // Verificar la contraseña actual
    const verifyResult = await verifyPassword(userEmail, currentPassword);

    if (!verifyResult.success) {
      Alert.alert("Error", verifyResult.message || "Contraseña actual incorrecta");
      return;
    }

    // Obtener el ID del usuario desde AsyncStorage
    const userId = await AsyncStorage.getItem("userId");

    // Si la contraseña actual es correcta, actualizar la contraseña usando updateUser
    try {
      await updateUser(userId, { password: newPassword });
      Alert.alert("Éxito", "Contraseña actualizada correctamente", [
        { text: "OK", onPress: () => onClose() }, // Cerrar el modal después de presionar "OK"
      ]);
    } catch (error) {
      Alert.alert("Error", error.message || "Error al actualizar la contraseña");
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón para cerrar el formulario */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#AA39AD" />
      </TouchableOpacity>

      <View style={styles.container2}>
        {/* Campo: Contraseña Actual */}
        <Input
          placeholder="Ingresa tu contraseña actual"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          label="Contraseña Actual"
          labelStyle={styles.label}
          inputStyle={styles.value}
          containerStyle={styles.field}
          secureTextEntry
        />

        {/* Campo: Nueva Contraseña */}
        <Input
          placeholder="Ingresa tu nueva contraseña"
          value={newPassword}
          onChangeText={setNewPassword}
          label="Nueva Contraseña"
          labelStyle={styles.label}
          inputStyle={styles.value}
          containerStyle={styles.field}
          secureTextEntry
        />

        {/* Campo: Confirmar Nueva Contraseña */}
        <Input
          placeholder="Confirma tu nueva contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          label="Confirmar Nueva Contraseña"
          labelStyle={styles.label}
          inputStyle={styles.value}
          containerStyle={styles.field}
          secureTextEntry
        />

        {/* Botón para enviar el formulario */}
        <Button
          title="Actualizar Contraseña"
          onPress={handleUpdatePassword}
          buttonStyle={styles.buttonLogin}
          titleStyle={styles.buttonText}
          disabled={isButtonDisabled} // Deshabilitar el botón si algún campo está vacío
        />
      </View>
    </View>
  );
};

// Estilos
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

export default EditPassword;