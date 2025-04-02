import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CourseItem from "../components/CourseItem";
import { getCourses, getCourseByStudent } from "../../../config/authService";
import Loading from "../../../kernel/components/Loading";

const Home = ({ navigation }) => {
  const [cursos, setCursos] = useState([]);
  const [misCursos, setMisCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const countActiveCourses = () => {
    return misCursos.filter(
      (course) =>
        course.enrollmentStatus === "Aceptado" &&
        (course.status === "Empezado" || course.status === "Aprobado")
    ).length;
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCursos(data || []);
    } catch (error) {
      console.error("❌ Error al obtener los cursos generales:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCoursesStudent = async () => {
    try {
      setLoading(true);
      const studentId = await AsyncStorage.getItem("userId");

      if (!studentId) throw new Error("No se encontró el ID del estudiante.");

      const data = await getCourseByStudent(studentId);

      const cursosConStatus = await Promise.all(
        data.map(async (curso) => {
          const enrollmentStatus = await getEnrollmentStatus(
            curso.enrollments,
            studentId
          );
          return { ...curso, enrollmentStatus };
        })
      );

      setMisCursos(cursosConStatus);
    } catch (error) {
      console.error("❌ Error al obtener los cursos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEnrollmentStatus = async (enrollments = [], studentId) => {
    studentId = studentId.toString();
    const enrollment = enrollments.find(
      (enrollment) => enrollment.studentId.toString() === studentId
    );
    return enrollment?.status?.trim() || "No inscrito";
  };

  useEffect(() => {
    fetchCourses();
    fetchCoursesStudent();
  }, []);

  const handleRefresh = () => {
    if (!refreshing) {
      setRefreshing(true);
      fetchCourses();
      fetchCoursesStudent();
    }
  };

  const approvedCourses = cursos.filter(course => 
    course.status === "Aprobado"
  );

  const handleCoursePress = (course) => {
    navigation.navigate("CourseDetails", { course });
  };

  if (loading) {
    return <Loading title="Cargando cursos..." size="large" color="#AA39AD" />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color="#d32f2f" />
        <Text style={styles.errorText}>Oops! Algo salió mal</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity 
          onPress={() => {
            fetchCourses();
            fetchCoursesStudent();
          }} 
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sección de Mis Cursos */}
      <View style={styles.misCursosContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.tituloPrincipal}>Mis Cursos</Text>
            <Text style={styles.subtitulo}>
              Total inscritos: {countActiveCourses()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.reloadIconContainer}
            disabled={refreshing}
          >
            <Icon
              name="refresh"
              size={24}
              color={refreshing ? "#ccc" : "#AA39AD"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de cursos aprobados */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {approvedCourses.length === 0 ? (
          <View style={styles.noCoursesContainer}>
            <Icon name="sentiment-dissatisfied" size={64} color="#AA39AD" />
            <Text style={styles.noCoursesText}>No hay cursos aprobados disponibles</Text>
            <Text style={styles.noCoursesSubtext}>Revisa más tarde para nuevas opciones</Text>
          </View>
        ) : (
          <>
            <Text style={styles.availableCoursesTitle}>Cursos Aprobados</Text>
            <FlatList
              data={approvedCourses}
              renderItem={({ item }) => (
                <CourseItem 
                  {...item} 
                  onPress={() => handleCoursePress(item)} 
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

// Estilos se mantienen iguales
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5", 
    paddingTop: 20,
  },
  scrollContainer: { 
    flex: 1, 
    paddingHorizontal: 16,
  },
  misCursosContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reloadIconContainer: { 
    padding: 10,
    borderRadius: 50,
    backgroundColor: "rgba(170, 57, 173, 0.1)",
  },
  tituloPrincipal: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#AA39AD" 
  },
  subtitulo: { 
    fontSize: 16, 
    color: "#666" 
  },
  availableCoursesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  noCoursesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  noCoursesText: { 
    fontSize: 18, 
    color: "#AA39AD", 
    textAlign: "center",
    marginTop: 15,
    fontWeight: "600"
  },
  noCoursesSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: { 
    fontSize: 22, 
    color: "#d32f2f",
    fontWeight: "bold",
    marginTop: 15,
  },
  errorSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#AA39AD",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;