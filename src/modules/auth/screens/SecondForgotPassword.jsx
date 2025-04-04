import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SecondForgotPassword = ({ route, navigation }) => {
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Un correo de verificación ha sido enviado a {email}, por favor, verifica la carpeta de spam</Text> 

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Entendido</Text>
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
    marginBottom: 5,
  },
  button: {
    width: '100%',
    backgroundColor: '#AA39AD',
    padding: 10,
    alignItems: 'center',
    marginTop: 90,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SecondForgotPassword;