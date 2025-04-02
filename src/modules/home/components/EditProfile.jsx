import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Alert, Text, ActivityIndicator } from "react-native";
import { Input, Button } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { updateUser } from "../../../config/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditProfile = ({ onClose, userData, onUpdate, setIsLoggedIn }) => {
  const [username, setUsername] = useState(userData.username || "");
  const [nombre, setNombre] = useState(userData.name || "");
  const [apellidos, setApellidos] = useState(`${userData.surname} ${userData.lastname}` || "");
  const [correo, setCorreo] = useState(userData.email || "");
  const [descripcion, setDescripcion] = useState(userData.description || "");
  // Se guarda la imagen completa con prefijo (ejemplo: "data:image/jpeg;base64,...") como string
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isCredentialsChanged, setIsCredentialsChanged] = useState(false);

  useEffect(() => {
    const fields = [username, nombre, apellidos, correo, descripcion];
    const isAnyFieldEmpty = fields.some((field) => field.trim() === "");
    setIsButtonDisabled(isAnyFieldEmpty || loadingImage || isSubmitting);

    if (username !== userData.username || correo !== userData.email) {
      setIsCredentialsChanged(true);
    } else {
      setIsCredentialsChanged(false);
    }
  }, [username, nombre, apellidos, correo, descripcion, loadingImage, isSubmitting, userData]);

  const handleSelectImage = async () => {
    try {
      // Se aceptan únicamente PNG, JPG/JPEG y WEBP
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/png", "image/jpeg", "image/webp"],
        copyToCacheDirectory: true,
      });
      console.log("Resultado del DocumentPicker:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log("Asset seleccionado:", asset);
        const fileUri = asset.uri;
        setLoadingImage(true);
        // Convertir la imagen a base64
        const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
        const base64String = base64.toString();
        
        // Determinar el prefijo según la extensión del archivo
        let imagePrefix = "data:image/png;base64,";
        if (asset.name) {
          const ext = asset.name.split('.').pop().toLowerCase();
          if (ext === "jpg" || ext === "jpeg") {
            imagePrefix = "data:image/jpeg;base64,";
          } else if (ext === "webp") {
            imagePrefix = "data:image/webp;base64,";
          }
        }
        const completeImage = imagePrefix + base64String;
        console.log("Imagen convertida a base64 (con prefijo):", completeImage);
        setSelectedProfileImage(completeImage);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    } finally {
      setLoadingImage(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const [surname, lastname] = apellidos.split(" ");
      const updatedData = {
        username,
        name: nombre,
        surname,
        lastname,
        email: correo,
        description: descripcion,
        // Se envía la imagen nueva en base64 si se seleccionó; de lo contrario se conserva la actual
        profileImage: selectedProfileImage || userData.profileImage || null,
      };

      console.log("Valor de selectedProfileImage:", selectedProfileImage);
      console.log("Datos actualizados a enviar:", updatedData);

      const userId = await AsyncStorage.getItem("userId");
      await updateUser(userId, updatedData);
      Alert.alert("Éxito", "Perfil actualizado correctamente");

      if (isCredentialsChanged) {
        Alert.alert("Aviso", "Has cambiado tu username o correo. Deberás iniciar sesión nuevamente.");
        await AsyncStorage.removeItem("authToken");
        setIsLoggedIn(false);
      }

      onClose();
      onUpdate(updatedData);
    } catch (error) {
      Alert.alert("Error", error.message);
      console.error("Error al actualizar el perfil:", error);
    } finally {
      setIsSubmitting(false);
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
          placeholder={userData.surname + " " + userData.lastname || "Ingresa tus apellidos"}
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
        <TouchableOpacity style={styles.imagePickerButton} onPress={handleSelectImage}>
          <Ionicons name="image" size={24} color="#fff" />
          <Text style={styles.imagePickerText}>Seleccionar Foto de Perfil</Text>
        </TouchableOpacity>
        {loadingImage && (
          <ActivityIndicator size="small" color="#6200ee" style={{ marginBottom: 16 }} />
        )}
        {selectedProfileImage && !loadingImage && (
          <Text style={styles.successText}>Imagen cargada correctamente</Text>
        )}
        <Button
          title="Actualizar Información"
          onPress={handleSubmit}
          buttonStyle={styles.buttonLogin}
          titleStyle={styles.buttonText}
          disabled={isButtonDisabled}
          loading={isSubmitting}
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
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    marginBottom: 16,
  },
  imagePickerText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  successText: {
    color: "green",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
});

export default EditProfile;
