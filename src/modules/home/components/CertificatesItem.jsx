import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, FlatList } from 'react-native';
import { getCourseByStudent } from '../../../config/authService';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const CertificatesItem = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const studentId = await AsyncStorage.getItem('userId');
        if (!studentId) throw new Error('Usuario no identificado');
        
        const courses = await getCourseByStudent(studentId);
        const validCertificates = [];
        
        const getImageSource = (image) => {
          if (!image) return 'https://i.ibb.co/6JBs9vG/cert-placeholder.png';
          if (image.startsWith('http')) return image;
          if (image.startsWith('data:image')) return image;
          return `data:image/jpeg;base64,${image}`;
        };
        
        courses.forEach(course => {
          const enrollment = course.enrollments.find(
            e => e.studentId?.toString() === studentId.toString()
          );

          if (enrollment?.certificateDelivered && enrollment?.certificateFile) {
            // Generar IDs únicos con fallback seguro
            const courseId = course._id 
              ? course._id 
              : `temp-course-${Math.random().toString(36).substr(2, 9)}`;
            
            const enrollmentId = enrollment._id 
              ? enrollment._id 
              : `temp-enroll-${Math.random().toString(36).substr(2, 9)}`;
            
            validCertificates.push({
              id: `cert-${courseId}-${enrollmentId}`, // Key único garantizado
              titulo: course.titulo,
              instructor: course.docenteId?.nombre || 'Instituto Certificador',
              fecha: new Date(enrollment.updatedAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }),
              imagen: getImageSource(course.coverImage),
              pdfBase64: enrollment.certificateFile
            });
          }
        });
        
        setCertificates(validCertificates);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, []);

  const handleOpenPDF = async (base64Data) => {
    try {
      const fileName = `Certificado_${Date.now()}.pdf`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });

      const contentUri = await FileSystem.getContentUriAsync(fileUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/pdf'
      });
      
    } catch (error) {
      Alert.alert('Error', 'Necesitas una aplicación para ver PDFs');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="hourglass-top" size={40} color="#4F46E5" />
        <Text style={styles.loadingText}>Cargando tus logros...</Text>
      </View>
    );
  }

  if (!certificates.length) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="school" size={80} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>Aún no tienes certificados</Text>
        <Text style={styles.emptySubtitle}>
          Completa los cursos y podrás descargar{'\n'}tus certificados aquí
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={certificates}
      contentContainerStyle={styles.listContainer}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image
            source={{ uri: item.imagen }}
            style={styles.courseImage}
            resizeMode="cover"
          />
          
          <View style={styles.content}>
            <Text style={styles.courseTitle} numberOfLines={2}>{item.titulo}</Text>
            
            <View style={styles.infoContainer}>
              <View style={styles.infoBadge}>
                <MaterialIcons name="verified" size={16} color="#10B981" />
                <Text style={styles.infoText}>Certificado válido</Text>
              </View>
              <View style={styles.infoBadge}>
                <MaterialIcons name="person" size={16} color="#3B82F6" />
                <Text style={styles.infoText} numberOfLines={1}>{item.instructor}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleOpenPDF(item.pdfBase64)}
              >
                <MaterialIcons name="visibility" size={18} color="white" />
                <Text style={styles.buttonText}>Ver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24
  },
  listContainer: {
    padding: 16,
    backgroundColor: '#F8FAFC'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden'
  },
  courseImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0'
  },
  content: {
    padding: 16
  },
  courseTitle: {
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 22
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'Inter-Medium',
    maxWidth: 120
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.3
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Medium'
  },
  emptyTitle: {
    fontSize: 16,
    color: '#0F172A',
    marginTop: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20
  }
});

export default CertificatesItem;