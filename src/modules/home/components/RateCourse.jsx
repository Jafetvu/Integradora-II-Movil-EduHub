import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { rateCourse, checkTokenExpiration, logout } from '../../../config/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function RateCourse({ courseId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    setHasRated(false);
    setRating(0);
    setComment('');
  }, [courseId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Por favor selecciona una calificación',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const tokenValid = await checkTokenExpiration();
      if (!tokenValid) {
        await logout();
        Toast.show({
          type: 'error',
          text1: 'Sesión expirada',
          text2: 'Por favor inicia sesión nuevamente',
        });
        return;
      }
      const userId = await AsyncStorage.getItem('userId');

      const result = await rateCourse(courseId, rating, comment, userId);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Éxito',
          text2: '¡Calificación enviada correctamente!',
        });
        setRating(0);
        setComment('');
        setHasRated(true);
      } else {
        handleApiError(result);
      }
    } catch (error) {
      console.error('Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error de conexión. Inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApiError = (result) => {
    let message = result.message || 'Error al enviar la calificación';
    
    if (result.status === 401) {
      message = 'No estás inscrito en este curso';
    } else if (result.status === 400) {
      message = 'Ya calificaste este curso';
    } else if (result.status === 404) {
      message = 'Curso no encontrado';
    }
    
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
    });
    
    if (result.unauthorized) {
      logout();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Califica este curso</Text>
      
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => !isSubmitting && !hasRated && setRating(star)}
            onPressIn={() => !isSubmitting && !hasRated && setHoverRating(star)}
            onPressOut={() => !isSubmitting && !hasRated && setHoverRating(0)}
            disabled={isSubmitting || hasRated}
          >
            <Ionicons 
              name={star <= (hoverRating || rating) ? 'star' : 'star-outline'}
              size={32}
              color={
                (isSubmitting || hasRated) ? '#CCCCCC' :
                star <= (hoverRating || rating) ? '#FFD700' : '#CCCCCC'
              }
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.ratingText}>
        {rating ? `Tu calificación: ${rating} estrella${rating > 1 ? 's' : ''}` : 'Selecciona una calificación'}
      </Text>
      
      <Text style={styles.label}>Comentario (opcional):</Text>
      <TextInput
        style={[styles.commentInput, (isSubmitting || hasRated) && styles.disabledInput]}
        multiline
        numberOfLines={4}
        placeholder="¿Qué te pareció el curso?"
        placeholderTextColor="#999"
        value={comment}
        onChangeText={setComment}
        editable={!isSubmitting && !hasRated}
      />
      
      <TouchableOpacity 
        style={[styles.submitButton, (isSubmitting || hasRated || rating === 0) && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={isSubmitting || hasRated || rating === 0}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
        </Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333333',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  star: {
    marginHorizontal: 5,
  },
  ratingText: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#666666',
  },
  label: {
    marginBottom: 8,
    color: '#555555',
    fontWeight: '500',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 100,
    backgroundColor: '#FAFAFA',
    color: '#333333',
  },
  disabledInput: {
    backgroundColor: '#EEE',
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
