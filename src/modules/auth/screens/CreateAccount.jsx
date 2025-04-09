import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Input, Icon } from '@rneui/themed';
import Toast from "react-native-toast-message";
import { checkEmail } from '../../../config/authService';

const CreateAccount = ({ navigation }) => {
  const [name, setName] = useState("");
  const [fullSurname, setFullSurname] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ name: "", fullSurname: "", email: "" });

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
    const newErrors = { name: "", fullSurname: "", email: "" };

    // Regex para permitir solo letras (incluyendo tildes) y espacios
    const lettersRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    // Validación para el nombre
    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
      isValid = false;
    } else if (!lettersRegex.test(name)) {
      newErrors.name = "El nombre solo puede contener letras y espacios";
      isValid = false;
    } else if (name.replace(/\s+/g, "").length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 letras";
      isValid = false;
    }

    // Validación para los apellidos
    if (!fullSurname.trim()) {
      newErrors.fullSurname = "Los apellidos son obligatorios";
      isValid = false;
    } else if (!lettersRegex.test(fullSurname)) {
      newErrors.fullSurname = "Los apellidos solo pueden contener letras y espacios";
      isValid = false;
    } else {
      // Verificar que cada palabra (apellido) tenga al menos 2 letras
      const surnamesArr = fullSurname.trim().split(/\s+/);
      for (let surname of surnamesArr) {
        if (surname.length < 2) {
          newErrors.fullSurname = "Cada apellido debe tener al menos 2 letras";
          isValid = false;
          break;
        }
      }
    }

    // Validación para el correo (sin cambios)
    if (!email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const splitSurnames = (fullSurname) => {
    const [surname, ...restSurnames] = fullSurname.split(" ");
    return {
      surname: surname || "",
      lastname: restSurnames.join(" ") || "",
    };
  };

  const clearInputs = () => {
    setName("");
    setFullSurname("");
    setEmail("");
  };

  const handleContinue = async () => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      const { status, message } = await checkEmail(email);

      if (status === 409) {
        showToast("error", "Error", "El correo electrónico ya está registrado.");
      } else if (status === 200) {
        const { surname, lastname } = splitSurnames(fullSurname);
        navigation.navigate("ContinueCreate", { name, surname, lastname, email });
        clearInputs();
      } else if (status === 403) {
        showToast("error", "Acceso denegado", "Contacta al administrador.");
      } else {
        showToast("error", "Error", "Respuesta inesperada del servidor.");
      }
    } catch (error) {
      console.error("Error en handleContinue:", error);
      showToast("error", "Error", "Ocurrió un problema con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Toast />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>¡Crea tu cuenta y aprende sin límites!</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Input
            placeholder="Ingresa tu nombre"
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
            value={name}
            onChangeText={setName}
            errorMessage={error.name}
            errorStyle={styles.errorStyle}
          />
        </View>

        <View style={styles.inputContainer}>
          <Input
            placeholder="Ingresa tus apellidos"
            placeholderTextColor="#8E8E8E"
            leftIcon={
              <Icon 
                name="users" 
                type="font-awesome" 
                size={20} 
                color="#AA39AD" 
              />
            }
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            value={fullSurname}
            onChangeText={setFullSurname}
            errorMessage={error.fullSurname}
            errorStyle={styles.errorStyle}
          />
        </View>

        <View style={styles.inputContainer}>
          <Input
            placeholder="Ingresa tu correo"
            placeholderTextColor="#8E8E8E"
            leftIcon={
              <Icon 
                name="envelope" 
                type="font-awesome" 
                size={20} 
                color="#AA39AD" 
              />
            }
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            errorMessage={error.email}
            errorStyle={styles.errorStyle}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, (loading || !name || !fullSurname || !email) && styles.disabledButton]}
        onPress={handleContinue}
        disabled={loading || !name || !fullSurname || !email}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continuar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
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
  button: {
    width: '100%',
    backgroundColor: '#AA39AD',
    padding: 15,
    alignItems: 'center',
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
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateAccount;
