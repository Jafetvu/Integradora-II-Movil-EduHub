import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Input, Button } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { verifyPassword, updateUser } from "../../../config/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const EditPassword = ({ onClose, userEmail }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // Estados para mostrar/ocultar contraseñas
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fields = [currentPassword, newPassword, confirmPassword];
    const isAnyFieldEmpty = fields.some((field) => field.trim() === "");
    setIsButtonDisabled(isAnyFieldEmpty);
  }, [currentPassword, newPassword, confirmPassword]);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      visibilityTime: 3000,
      position: "top",
      topOffset: 50,
    });
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast("error", "Error", "Las contraseñas no coinciden");
      return;
    }

    const verifyResult = await verifyPassword(userEmail, currentPassword);
    if (!verifyResult.success) {
      showToast("error", "Error", verifyResult.message || "Contraseña actual incorrecta");
      return;
    }

    const userId = await AsyncStorage.getItem("userId");
    try {
      await updateUser(userId, { password: newPassword });
      showToast("success", "Éxito", "Contraseña actualizada correctamente");
      onClose();
    } catch (error) {
      showToast("error", "Error", error.message || "Error al actualizar la contraseña");
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
          secureTextEntry={!showCurrent}
          rightIcon={
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <Ionicons
                name={showCurrent ? "eye" : "eye-off"}
                size={20}
                color="#AA39AD"
              />
            </TouchableOpacity>
          }
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
          secureTextEntry={!showNew}
          rightIcon={
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Ionicons
                name={showNew ? "eye" : "eye-off"}
                size={20}
                color="#AA39AD"
              />
            </TouchableOpacity>
          }
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
          secureTextEntry={!showConfirm}
          rightIcon={
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons
                name={showConfirm ? "eye" : "eye-off"}
                size={20}
                color="#AA39AD"
              />
            </TouchableOpacity>
          }
        />

        {/* Botón para enviar el formulario */}
        <Button
          title="Actualizar Contraseña"
          onPress={handleUpdatePassword}
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

export default EditPassword;
