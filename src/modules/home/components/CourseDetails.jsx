import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView
} from "react-native";
import { useState, useEffect } from "react";
import { getUserById, requestFreeEnrollment } from "../../../config/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function CourseDetails({ route, navigation }) {
  const { course } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleInscribirse = async () => {
    if (course.precio > 0) {
      navigation.navigate("PayCourse", { course });
    } else {
      try {
        const studentId = await AsyncStorage.getItem("userId");
        if (!studentId) {
          throw new Error("No se encontró el ID del estudiante.");
        }

        const result = await requestFreeEnrollment(course.id, studentId);

        if (result.success) {
          Alert.alert("Éxito", result.message);
        } else {
          Alert.alert("Error", result.message);
        }
      } catch (error) {
        console.error("Error en handleInscribirse:", error);
        Alert.alert("Error", "Ocurrió un error al solicitar la inscripción.");
      }
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const userId = course.docenteId;
      if (userId) {
        try {
          const userData = await getUserById(userId);
          setUser(userData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setError("No se encontró el ID del usuario");
        setLoading(false);
      }
    };
    loadUserData();
  }, [course.docenteId]);

  const renderProfileImage = () => {
    if (user?.profileImage) {
      return (
        <Image
          source={{ uri: user.profileImage }}
          style={styles.profileImage}
        />
      );
    } else {
      const initials = user ? `${user.name?.charAt(0) || ''}${user.surname?.charAt(0) || ''}`.toUpperCase() : 'NA';
      return (
        <View style={styles.profilePlaceholder}>
          <Text style={styles.profileInitials}>{initials}</Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Cargando información del curso...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={40} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Sección del instructor */}
      {user && (
        <View style={styles.teacherSection}>
          <View style={styles.teacherHeader}>
            <View style={styles.profileContainer}>
              {renderProfileImage()}
            </View>
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherLabel}>INSTRUCTOR DEL CURSO</Text>
              <Text style={styles.teacherName}>
                {user.name} {user.surname} {user.lastName}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
        </View>
      )}

      {/* Sección de información del curso */}
      <View style={styles.courseInfoSection}>
        <Text style={styles.title}>{course.titulo}</Text>
        <Text style={styles.description}>{course.descripcion}</Text>
        
        <View style={styles.detailsContainer}>
          {/* Precio */}
          <View style={styles.detailItem}>
            <FontAwesome name="money" size={20} color="#4CAF50" />
            <Text style={styles.detailText}>
              {course.precio === 0 ? "Gratis" : `$${course.precio.toLocaleString()}`}
            </Text>
          </View>
          
          {/* Categoría */}
          <View style={styles.detailItem}>
            <MaterialIcons name="category" size={20} color="#2196F3" />
            <Text style={styles.detailText}>{course.categoria}</Text>
          </View>
          
          {/* Fechas */}
          <View style={styles.dateSection}>
            <Text style={styles.sectionSubtitle}>FECHAS DEL CURSO</Text>
            <View style={styles.dateContainer}>
              <View style={styles.dateItem}>
                <MaterialIcons name="event-available" size={24} color="#FF9800" />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>Fecha de inicio</Text>
                  <Text style={styles.dateValue}>{course.fechaInicio}</Text>
                </View>
              </View>
              
              <View style={[styles.dateItem, styles.lastDateItem]}>
                <MaterialIcons name="event-busy" size={24} color="#F44336" />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>Fecha de finalización</Text>
                  <Text style={styles.dateValue}>{course.fechaFin}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.noteBox}>
          <MaterialIcons name="info-outline" size={24} color="#6200ee" />
          <Text style={styles.noteText}>
            Solamente podrás Inscribirte al curso si este aún no ha comenzado.
            Deberás esperar a que el curso inicie.
          </Text>
        </View>
      </View>

      {/* Botón de inscripción */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleInscribirse}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {course.precio > 0 ? "PAGAR E INSCRIBIRME" : "INSCRIBIRME GRATIS"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  teacherSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInitials: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 16,
  },
  courseInfoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 12,
    fontWeight: '500',
  },
  dateSection: {
    marginTop: 20,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  dateContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  lastDateItem: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dateTextContainer: {
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#f0e6ff',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  noteText: {
    fontSize: 14,
    color: '#6200ee',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#AA39AD',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    margin: 16,
    marginTop: 24,
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});