import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Input, Icon, Image } from "@rneui/themed";
import { login } from "../../../config/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const Login = ({ navigation, setIsLoggedIn }) => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({ user: "", password: "" });
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

  const handleLogin = async () => {
    setError({ user: "", password: "" });
    
    if (!user || !password) {
      setError({
        user: user ? "" : "El nombre de usuario es obligatorio.",
        password: password ? "" : "La contraseña es obligatoria.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(user, password);

      if (result.success) {
        await AsyncStorage.setItem("authToken", result.token);
        setIsLoggedIn(true);
        showToast("success", "Inicio de sesión exitoso", "Bienvenido de nuevo");
      } else {
        if (result.invalidRole) {
          showToast("error", "Acceso restringido", result.message);
          setUser("");
          setPassword("");
        } else {
          showToast("error", "Error", result.message || "No se pudo iniciar sesión.");
        }
      }
    } catch (error) {
      console.error("Error en handleLogin:", error);
      showToast("error", "Error inesperado", "Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Toast />
      <View style={styles.logoContainer}>
        <Image 
          source={require("../../../../assets/eduhub-icon.png")} 
          style={styles.logo} 
        />
        <Text style={styles.welcomeText}>¡Hola de nuevo!</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Input
            placeholder="Usuario"
            placeholderTextColor="#8E8E8E"
            leftIcon={
              <Icon 
                name="user" 
                type="font-awesome" 
                size={20} 
                color="#AA39AD" 
              />
            }
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            value={user}
            onChangeText={setUser}
            errorMessage={error.user}
            errorStyle={styles.errorStyle}
          />
        </View>

        <View style={styles.inputContainer}>
          <Input
            placeholder="Contraseña"
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
            value={password}
            onChangeText={setPassword}
            secureTextEntry={showPassword}
            errorMessage={error.password}
            errorStyle={styles.errorStyle}
          />
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate("ForgotPassword")}
          style={styles.forgotPasswordContainer}
        > 
          <Text style={styles.forgotPasswordText}>Olvidé mi contraseña</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.buttonLogin, 
            isLoading && styles.disabledButton
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonCreateAccount} 
          onPress={() => navigation.navigate("CreateAccount")}
        > 
          <Text style={styles.buttonCreateAccountText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
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
  buttonContainer: {
    marginTop: 10,
  },
  buttonLogin: {
    backgroundColor: "#AA39AD",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#AA39AD",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonCreateAccount: {
    backgroundColor: "#604274",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    shadowColor: "#604274",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonCreateAccountText: {
    color: "white", 
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#AA39AD",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default Login;