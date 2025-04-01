import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getCourseByStudent } from "../../../config/authService";
import Loading from "../../../kernel/components/Loading";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const Courses = ({ navigation }) => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // Función para contar cursos activos (Aceptado y no Finalizado)
  const countActiveCourses = () => {
    return cursos.filter(
      (course) =>
        course.enrollmentStatus === "Aceptado" || "En curso" && course.status !== "Finalizado"
    ).length;
  };
  // Contar cursos finalizados
  const countFinishedCourses = () => {
    return cursos.filter(
      (course) =>
        course.enrollmentStatus === "Completado" && course.status === "Finalizado"
    ).length;
  };

  const getImageSource = (image) => {
    if (!image) {
      return { uri: "https://via.placeholder.com/100" };
    }

    if (image.startsWith("http") || image.startsWith("https")) {
      return { uri: image };
    } else {
      return { uri: `data:image/jpeg;base64,${image}` };
    }
  };

  const getCourseStatusInfo = (status) => {
    if (!status) return { text: "No disponible", style: styles.statusDefault };

    const normalizedStatus = status.toString().toLowerCase().trim();

    switch (normalizedStatus) {
      case "aprobado":
        return { text: "Por empezar", style: styles.statusEsperando };
      case "empezado":
        return { text: "En progreso", style: styles.statusEnProgreso };
      case "finalizado":
        return { text: "Finalizado", style: styles.statusFinalizado };
      default:
        return { text: status, style: styles.statusDefault };
    }
  };

  const handleCoursePress = (course) => {
    if (course.status === "Aprobado") {
      Alert.alert(
        "Curso no disponible",
        "Este curso aún no ha comenzado. Por favor espera a que inicie.",
        [{ text: "OK" }]
      );
    } else {
      navigation.navigate("StudentCourse", { course });
    }
  };

  const fetchCourses = async () => {
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

      setCursos(cursosConStatus);
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
  }, [refresh]);

  if (loading)
    return <Loading title="Cargando cursos..." size="large" color="#6200ee" />;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={cursos}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View style={styles.cajaMisCursos}>
            <View style={styles.headerContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.title}>Mis cursos</Text>
                <Text style={styles.subtitle}>
                  Total inscritos: {countActiveCourses()}
                </Text>
                <Text style={styles.subtitle}>
                  Cursos finalizados: {countFinishedCourses()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setRefresh(!refresh)}
                style={styles.reloadIcon}
              >
                <Icon name="refresh" size={24} color="#6200ee" />
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const courseStatus = getCourseStatusInfo(item.status);
          const isDisabled =
            item.enrollmentStatus === "Pendiente" || item.status === "Aprobado";

          return (
            <TouchableOpacity
              onPress={() => handleCoursePress(item)}
              disabled={isDisabled}
            >
              <View
                style={[styles.courseItem, isDisabled && styles.disabledCourse]}
              >
                <Image
                  source={getImageSource(item.coverImage)}
                  style={styles.courseImage}
                  resizeMode="cover"
                />
                <View style={styles.courseDetails}>
                  <Text style={styles.courseTitle}>{item.titulo}</Text>
                  <Text style={styles.courseDescription} numberOfLines={2}>
                    {item.descripcion}
                  </Text>

                  <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                      <MaterialIcons
                        name="attach-money"
                        size={16}
                        color="#4CAF50"
                      />
                      <Text style={styles.courseInfo}>
                        {item.precio === 0 ? "Gratis" : `$${item.precio}`}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <MaterialIcons
                        name="category"
                        size={16}
                        color="#2196F3"
                      />
                      <Text style={styles.courseInfo}>{item.categoria}</Text>
                    </View>
                  </View>

                  <View style={styles.datesContainer}>
                    <View style={styles.dateItem}>
                      <MaterialIcons
                        name="event-available"
                        size={16}
                        color="#FF9800"
                      />
                      <Text style={styles.dateText}>{item.fechaInicio}</Text>
                    </View>

                    <View style={styles.dateItem}>
                      <MaterialIcons
                        name="event-busy"
                        size={16}
                        color="#F44336"
                      />
                      <Text style={styles.dateText}>{item.fechaFin}</Text>
                    </View>
                  </View>

                  <View style={styles.statusesContainer}>
                    <View style={[styles.statusBox, courseStatus.style]}>
                      <Text style={styles.statusText}>{courseStatus.text}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusBox,
                        item.enrollmentStatus === "Aceptado"
                          ? styles.statusAprobado
                          : item.enrollmentStatus === "Pendiente"
                          ? styles.statusPendiente
                          : styles.statusNoInscrito,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {item.enrollmentStatus}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="school" size={48} color="#9E9E9E" />
            <Text style={styles.noCoursesText}>
              No estás inscrito en ningún curso
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate("HomeStack")}
            >
              <Text style={styles.exploreButtonText}>Explorar cursos</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cajaMisCursos: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reloadIcon: {
    padding: 10,
    backgroundColor: "#F0E5FF",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 18,
    color: "#D32F2F",
    textAlign: "center",
    marginVertical: 20,
    fontWeight: "600",
  },
  sectionHeader: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6A1B9A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noCoursesText: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
    marginVertical: 12,
    fontStyle: "italic",
  },
  exploreButton: {
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    minWidth: 200,
  },
  exploreButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  courseItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  disabledCourse: {
    opacity: 0.6,
  },
  courseImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#E6E6E6",
  },
  courseDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#37474F",
  },
  courseDescription: {
    fontSize: 14,
    color: "#546E7A",
    marginBottom: 8,
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseInfo: {
    fontSize: 13,
    color: "#455A64",
    marginLeft: 4,
    fontWeight: "500",
  },
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    color: "#455A64",
    marginLeft: 4,
  },
  statusesContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 8,
    flexWrap: "wrap",
  },
  statusBox: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 100,
    alignItems: "center",
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  statusAprobado: {
    backgroundColor: "#2E7D32",
  },
  statusPendiente: {
    backgroundColor: "#F57C00",
  },
  statusNoInscrito: {
    backgroundColor: "#78909C",
  },
  statusEsperando: {
    backgroundColor: "#0288D1",
  },
  statusEnProgreso: {
    backgroundColor: "#7B1FA2",
  },
  statusFinalizado: {
    backgroundColor: "#D32F2F",
  },
  statusDefault: {
    backgroundColor: "#607D8B",
  },
});

export default Courses;
