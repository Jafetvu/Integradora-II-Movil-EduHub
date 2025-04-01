import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const CourseItem = ({ 
  titulo, 
  precio, 
  descripcion, 
  categoria, 
  fechaInicio, 
  coverImage, 
  onPress, 
  fechaFin
}) => {
  const getImageSource = () => {
    if (!coverImage) {
      return { uri: "https://via.placeholder.com/100" };
    }
    
    if (coverImage.startsWith('http') || coverImage.startsWith('https')) {
      return { uri: coverImage };
    } else {
      return { uri: `data:image/jpeg;base64,${coverImage}` };
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.cursoItem}>
      <View style={styles.contenido}>
        <Image 
          source={getImageSource()} 
          style={styles.imagen} 
          resizeMode="cover"
        />
        <View style={styles.detalles}>
          <Text style={styles.titulo} numberOfLines={2} ellipsizeMode="tail">
            {titulo}
          </Text>
          
          <View style={styles.infoRow}>
            <FontAwesome name="money" size={16} color="#4CAF50" />
            <Text style={styles.precio}>
              {precio === 0 ? "Gratis" : `$${precio}`}
            </Text>
          </View>
          
          <Text style={styles.descripcion} numberOfLines={2} ellipsizeMode="tail">
            {descripcion}
          </Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.infoRow}>
              <MaterialIcons name="category" size={16} color="#2196F3" />
              <Text style={styles.categoria}>{categoria}</Text>
            </View>
            
            <View style={styles.fechasContainer}>
              <View style={styles.fechaItem}>
                <MaterialIcons name="event-available" size={16} color="#FF9800" />
                <Text style={styles.fechaTexto}>{fechaInicio}</Text>
              </View>
              
              <View style={styles.fechaItem}>
                <MaterialIcons name="event-busy" size={16} color="#F44336" />
                <Text style={styles.fechaTexto}>{fechaFin}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cursoItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  contenido: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  imagen: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  detalles: {
    flex: 1,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  precio: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: 'column',
  },
  categoria: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 8,
    fontWeight: '500',
  },
  fechasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fechaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fechaTexto: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  botonInscribirse: {
    flexDirection: 'row',
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CourseItem;