import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const AlertItem = ({ titulo, descripcionAccion, fecha, imagen, leida }) => {
  return (
    <View style={[styles.container, leida ? styles.leida : styles.noLeida]}>
      {/* Foto en formato circular */}
      <Image source={{ uri: imagen }} style={styles.foto} />

      {/* Contenido de la notificación */}
      <View style={styles.contenido}>
        {/* Título y fecha en la misma línea */}
        <View style={styles.tituloFecha}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.fecha}>{fecha}</Text>
        </View>

        {/* Descripción de la acción */}
        <Text style={styles.descripcionAccion}>{descripcionAccion}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noLeida: {
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee', // Borde resaltado para no leídas
  },
  leida: {
    opacity: 0.7, // Opacidad reducida para leídas
  },
  foto: {
    width: 50,
    height: 50,
    borderRadius: 25, // Foto circular
    marginRight: 16,
  },
  contenido: {
    flex: 1,
  },
  tituloFecha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fecha: {
    fontSize: 12,
    color: '#666',
  },
  descripcionAccion: {
    fontSize: 14,
    color: '#666',
  },
});

export default AlertItem;