import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Input, Icon } from "@rneui/themed";
import { register } from "../../../config/authService";
import { CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";

const ContinueCreate = ({ route = {}, navigation }) => {
  const { name = "", surname = "", email = "", lastname = "" } = route.params || {};

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({ username: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(true);
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

  const validateFields = () => {
    let isValid = true;
    const newErrors = { username: "", password: "", confirmPassword: "" };

    if (!username.trim()) {
      newErrors.username = "El apodo es obligatorio";
      isValid = false;
    } else if (username.trim().length < 3) {
      newErrors.username = "El apodo debe tener más de 2 letras";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirma tu contraseña";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;
    setIsLoading(true);

    const userData = {
      name,
      surname,
      email,
      username,
      password,
      role: "ROLE_STUDENT",
      description: "",
      isValidated: true,
      lastname,
    };

    try {
      const response = await register(userData);

      if (response.status === 200) {
        showToast("success", "Éxito", "Usuario registrado correctamente");
        setTimeout(() => {
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          );
        }, 3000);
      } else {
        showToast("error", "Error", `Error en el registro. Estado HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      showToast("error", "Error", "No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Toast />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>¿Cómo te gustaría que te llamemos?</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Input
            placeholder="Ingresa tu apodo"
            placeholderTextColor="#8E8E8E"
            leftIcon={
              <Icon 
                name="user-circle" 
                type="font-awesome" 
                size={20} 
                color="#AA39AD" 
              />
            }
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            value={username}
            onChangeText={setUsername}
            errorMessage={error.username}
            errorStyle={styles.errorStyle}
          />
        </View>

        <Text style={styles.note}>Piensa en una contraseña segura</Text>

        <View style={styles.inputContainer}>
          <Input
            placeholder="Ingresa una contraseña"
            placeholderTextColor="#8E8E8E"
            leftIcon={
              <Icon 
                name="lock" 
                type="font-awesome" 
                size={20} 
                color="#AA39AD" 
              />
            }
            rightIcon={
              <Icon 
                name={showPassword ? "eye-slash" : "eye"} 
                type="font-awesome" 
                color="#AA39AD" 
                onPress={() => setShowPassword(!showPassword)} 
              />
            }
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            secureTextEntry={showPassword}
            value={password}
            onChangeText={setPassword}
            errorMessage={error.password}
            errorStyle={styles.errorStyle}
          />
        </View>

        <View style={styles.inputContainer}>
          <Input
            placeholder="Confirmar contraseña"
            placeholderTextColor="#8E8E8E"
            leftIcon={
              <Icon 
                name="lock" 
                type="font-awesome" 
                size={20} 
                color="#AA39AD" 
              />
            }
            rightIcon={
              <Icon 
                name={showPassword ? "eye-slash" : "eye"} 
                type="font-awesome" 
                color="#AA39AD" 
                onPress={() => setShowPassword(!showPassword)} 
              />
            }
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            secureTextEntry={showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            errorMessage={error.confirmPassword}
            errorStyle={styles.errorStyle}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, (isLoading || !username || !password || !confirmPassword) && styles.disabledButton]}
        onPress={handleRegister}
        disabled={isLoading || !username || !password || !confirmPassword}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>¡Empieza a aprender!</Text>
        )}
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
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  note: {
    fontSize: 14,
    color: "#6E6E6E",
    alignSelf: "flex-start",
    marginLeft: 10,
    marginBottom: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#AA39AD",
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#AA39AD",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ContinueCreate;
