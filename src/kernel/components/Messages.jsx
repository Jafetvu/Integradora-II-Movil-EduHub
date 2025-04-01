import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Messages = ({ title, message, image }) => {
  console.log("Imagen recibida en Messages:", image); // Depuración

  return (
    <View style={styles.card}>
      {image && (
        <Image
          source={image}
          style={styles.image}
          resizeMode="cover" // Asegúrate de que la imagen se ajuste correctamente
        />
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '80%', // Ancho del contenedor
    alignItems: 'center', // Centra el contenido horizontalmente
    justifyContent: 'center', // Centra el contenido verticalmente
  },
  image: {
    width: 150, // Ancho de la imagen
    height: 150, // Alto de la imagen
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center', // Centra el texto horizontalmente
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center', // Centra el texto horizontalmente
  },
});

export default Messages;