import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Input } from '@rneui/themed';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState({ email: "" });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresa tu correo electrónico para recuperar tu contraseña</Text>

      <Input
        style={styles.input}
        placeholder="Ingresa tu correo electrónico"
        label="Correo Electronico"
        inputContainerStyle={{ width: '100%' }}
        onChange={({ nativeEvent: { text } }) => setEmail(text)}
        errorMessage={error.name}
      />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SecondForgotPassword')}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>O inicia sesión</Text>
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontSize: 16,
    marginTop: 20,
  },
  input: {
    width: '100%',
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#AA39AD',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  loginText: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  loginButton: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#604274',
    borderRadius: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ForgotPassword;