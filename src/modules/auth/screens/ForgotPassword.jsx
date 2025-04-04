import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Input, Icon } from "@rneui/themed";
import { forgotPassword } from "../../../config/authService";
import Toast from "react-native-toast-message";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState({ email: "" });
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      visibilityTime: 3000,
      position: "top",
    });
  };

  const handleForgotPassword = async () => {
    setError({ email: "" });
    if (!email) {
      setError({ email: "Por favor, ingresa un correo electrónico." });
      showToast("error", "Error", "Por favor, ingresa un correo electrónico.");
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      showToast("success", "Éxito", result.message);
      navigation.navigate("SecondForgotPassword", { email });
    } else {
      setError({ email: result.message });
      showToast("error", "Error", result.message);
    }
  };

  return (
    <View style={styles.container}>
      <Toast />
      <Text style={styles.title}>
        Ingresa tu correo electrónico para recuperar tu contraseña
      </Text>
      <View style={styles.formContainer}>
        <Input
          placeholder="Ingresa tu correo electrónico"
          label="Correo Electrónico"
          leftIcon={
            <Icon name="envelope" type="font-awesome" size={20} color="#AA39AD" />
          }
          inputContainerStyle={styles.inputContainerStyle}
          inputStyle={styles.inputStyle}
          value={email}
          onChangeText={setEmail}
          errorMessage={error.email}
          errorStyle={styles.errorStyle}
        />
        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleForgotPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  inputStyle: {
    marginLeft: 10,
    color: "#333",
  },
  errorStyle: {
    color: "#d32f2f",
    marginLeft: 15,
  },
  button: {
    backgroundColor: "#AA39AD",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#AA39AD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#604274",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    shadowColor: "#604274",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ForgotPassword;
