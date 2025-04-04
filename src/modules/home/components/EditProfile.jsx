import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { Input, Button } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { updateUser, checkEmail } from "../../../config/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Messages from "../../../kernel/components/Messages";

const EditProfile = ({ onClose, userData, onUpdate, setIsLoggedIn }) => {
  const [username, setUsername] = useState(userData.username || "");
  const [nombre, setNombre] = useState(userData.name || "");
  const [apellidos, setApellidos] = useState(
    `${userData.surname} ${userData.lastname}` || ""
  );
  const [correo, setCorreo] = useState(userData.email || "");
  const [descripcion, setDescripcion] = useState(userData.description || "");
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isCredentialsChanged, setIsCredentialsChanged] = useState(false);
  const [messageData, setMessageData] = useState(null);

  useEffect(() => {
    const fields = [username, nombre, apellidos, correo, descripcion];
    const isAnyFieldEmpty = fields.some((field) => field.trim() === "");
    setIsButtonDisabled(isAnyFieldEmpty || loadingImage || isSubmitting);

    if (
      username !== userData.username ||
      correo.trim().toLowerCase() !== userData.email.trim().toLowerCase()
    ) {
      setIsCredentialsChanged(true);
    } else {
      setIsCredentialsChanged(false);
    }
  }, [
    username,
    nombre,
    apellidos,
    correo,
    descripcion,
    loadingImage,
    isSubmitting,
    userData,
  ]);

  const showMessage = (title, message, image = null) => {
    setMessageData({ title, message, image });
    setTimeout(() => setMessageData(null), 3000);
  };

  const handleSelectImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/png", "image/jpeg", "image/webp"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setLoadingImage(true);
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        let imagePrefix = "data:image/png;base64,";
        if (asset.name) {
          const ext = asset.name.split(".").pop().toLowerCase();
          if (ext === "jpg" || ext === "jpeg") {
            imagePrefix = "data:image/jpeg;base64,";
          } else if (ext === "webp") {
            imagePrefix = "data:image/webp;base64,";
          }
        }
        setSelectedProfileImage(imagePrefix + base64);
      }
    } catch (error) {
      showMessage("Error", "No se pudo seleccionar la imagen");
    } finally {
      setLoadingImage(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (correo.trim().toLowerCase() !== userData.email.trim().toLowerCase()) {
        const emailCheck = await checkEmail(correo);
        if (emailCheck.status !== 200) {
          showMessage("Error en el correo", emailCheck.message);
          setIsSubmitting(false);
          return;
        }
      }
      const [surname, lastname] = apellidos.split(" ");
      const updatedData = {
        username,
        name: nombre,
        surname,
        lastname,
        email: correo,
        description: descripcion,
        profileImage: selectedProfileImage || userData.profileImage || null,
      };

      const userId = await AsyncStorage.getItem("userId");
      await updateUser(userId, updatedData);
      showMessage("Éxito", "Perfil actualizado correctamente");

      if (isCredentialsChanged) {
        showMessage("Aviso", "Has cambiado tu username o correo. Deberás iniciar sesión nuevamente");
        await AsyncStorage.removeItem("authToken");
        setIsLoggedIn(false);
      }
      onClose();
      onUpdate(updatedData);
    } catch (error) {
      showMessage("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {messageData && (
        <View style={styles.messageContainer}>
          <Messages
            title={messageData.title}
            message={messageData.message}
            image={messageData.image}
          />
        </View>
      )}
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
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={handleSelectImage}
        >
          <Ionicons name="image" size={24} color="#fff" />
          <Text style={styles.imagePickerText}>Seleccionar Foto de Perfil</Text>
        </TouchableOpacity>
        {loadingImage && (
          <ActivityIndicator
            size="small"
            color="#6200ee"
            style={{ marginBottom: 16 }}
          />
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
    alignSelf: "center",
    marginVertical: 16,
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
  messageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});

export default EditProfile;
