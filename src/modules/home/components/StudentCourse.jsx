import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome,
  Ionicons,
  AntDesign,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RateCourse from "./RateCourse";
import { completeSession } from "../../../config/authService";

const { width } = Dimensions.get("window");

const StudentCourse = ({ route, navigation }) => {
  const course = route?.params?.course;
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await AsyncStorage.getItem(
          `courseProgress_${course.id}`
        );
        if (progress) {
          setCompletedSessions(JSON.parse(progress));
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setLoadingProgress(false);
      }
    };

    if (course?.id) {
      loadProgress();
    }
  }, [course?.id]);

  

  const handleSessionPress = async (session, index) => {
    try {
      if (index === 0 || completedSessions.includes(index - 1)) {
        await markSessionAsCompleted(index);
        navigation.navigate("SessionsCourse", {
          session,
          courseTitle: course.titulo,
        });
      } else {
        Alert.alert(
          "Sesión bloqueada",
          `Debes completar la sesión ${index} antes de acceder a esta.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      if (error.unauthorized) {
        navigation.navigate("Login");
      }
    }
  };

  const markSessionAsCompleted = async (sessionIndex) => {
    setUpdatingProgress(true);
    try {
      if (!completedSessions.includes(sessionIndex)) {
        const updatedSessions = [...completedSessions, sessionIndex];
        setCompletedSessions(updatedSessions);
        await AsyncStorage.setItem(
          `courseProgress_${course.id}`,
          JSON.stringify(updatedSessions)
        );

        const studentId = await AsyncStorage.getItem("userId");
        const sessionId = course.sessions[sessionIndex]?.id;

        if (!studentId || !sessionId) {
          throw new Error("Faltan datos requeridos");
        }

        const result = await completeSession(course.id, studentId, sessionId);

        if (!result.success) {
          const revertedSessions = completedSessions.filter(
            (i) => i !== sessionIndex
          );
          setCompletedSessions(revertedSessions);
          await AsyncStorage.setItem(
            `courseProgress_${course.id}`,
            JSON.stringify(revertedSessions)
          );
          throw new Error(result.message);
        }

        if (result.progress) {
          console.log("Progreso actualizado:", result.progress);
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo guardar el progreso");
      throw error;
    } finally {
      setUpdatingProgress(false);
    }
  };

  const getImageSource = () => {
    if (!course?.coverImage) return { uri: "https://via.placeholder.com/300" };
    if (course.coverImage.startsWith("http")) return { uri: course.coverImage };
    return { uri: `data:image/jpeg;base64,${course.coverImage}` };
  };

  const formatEnrollmentStatus = (status) => {
    const statusMap = {
      active: "Activo",
      completed: "Completado",
      cancelled: "Cancelado",
      pending: "Pendiente",
      Aceptado: "Aceptado",
      Pendiente: "Pendiente",
      Cancelado: "Cancelado",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: "#4CAF50",
      completed: "#4CAF50",
      cancelled: "#F44336",
      pending: "#2196F3",
      Aceptado: "#4CAF50",
      Pendiente: "#2196F3",
      Cancelado: "#F44336",
    };
    return statusColors[status] || "#FFC107";
  };

  const resetProgress = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem(`courseProgress_${course.id}`);
      setCompletedSessions([]);
      Alert.alert("Progreso reiniciado", "Tu progreso ha sido reiniciado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo reiniciar el progreso");
    } finally {
      setLoading(false);
    }
  };

  const renderSessions = () => {
    if (!course?.sessions?.length) {
      return (
        <View style={styles.noSessionsContainer}>
          <Ionicons name="book-outline" size={40} color="#999" />
          <Text style={styles.noSessionsText}>No hay sesiones disponibles</Text>
        </View>
      );
    }

    if (loadingProgress) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Cargando progreso...</Text>
        </View>
      );
    }

    return (
      <View style={styles.sessionsContainer}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="video-library" size={24} color="#444" />
          <Text style={styles.sectionTitle}>Sesiones del Curso</Text>
        </View>

        {course.sessions.map((session, index) => (
          <TouchableOpacity
            key={`session-${session.id}-${index}`}
            style={[
              styles.sessionCard,
              index > 0 &&
                !completedSessions.includes(index - 1) &&
                styles.lockedSession,
              completedSessions.includes(index) && styles.completedSession,
            ]}
            onPress={() => handleSessionPress(session, index)}
            disabled={
              (index > 0 && !completedSessions.includes(index - 1)) ||
              updatingProgress
            }
          >
            {updatingProgress && (
              <ActivityIndicator
                size="small"
                color="#6200ee"
                style={styles.loadingIndicator}
              />
            )}

            <View
              style={[
                styles.sessionNumber,
                index > 0 &&
                  !completedSessions.includes(index - 1) &&
                  styles.lockedSessionNumber,
                completedSessions.includes(index) &&
                  styles.completedSessionNumber,
              ]}
            >
              {index > 0 && !completedSessions.includes(index - 1) ? (
                <MaterialIcons name="lock" size={16} color="#fff" />
              ) : completedSessions.includes(index) ? (
                <MaterialIcons name="check" size={16} color="#fff" />
              ) : (
                <Text style={styles.sessionNumberText}>{index + 1}</Text>
              )}
            </View>

            <View style={styles.sessionContent}>
              <View style={styles.sessionHeader}>
                <Text
                  style={[
                    styles.sessionTitle,
                    index > 0 &&
                      !completedSessions.includes(index - 1) &&
                      styles.lockedSessionTitle,
                  ]}
                >
                  {session.nameSession || `Sesión ${index + 1}`}
                </Text>
                {completedSessions.includes(index) && (
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#4CAF50"
                  />
                )}
              </View>

              <View style={styles.sessionMeta}>
                {session.duracion && (
                  <View style={styles.sessionMetaItem}>
                    <MaterialIcons
                      name="access-time"
                      size={14}
                      color={
                        index > 0 && !completedSessions.includes(index - 1)
                          ? "#999"
                          : "#666"
                      }
                    />
                    <Text
                      style={[
                        styles.sessionMetaText,
                        index > 0 &&
                          !completedSessions.includes(index - 1) &&
                          styles.lockedSessionText,
                      ]}
                    >
                      {session.duracion}
                    </Text>
                  </View>
                )}

                <View style={styles.sessionMetaItem}>
                  <FontAwesome
                    name="file"
                    size={14}
                    color={
                      index > 0 && !completedSessions.includes(index - 1)
                        ? "#999"
                        : "#666"
                    }
                  />
                  <Text
                    style={[
                      styles.sessionMetaText,
                      index > 0 &&
                        !completedSessions.includes(index - 1) &&
                        styles.lockedSessionText,
                    ]}
                  >
                    {session.multimedia?.length || 0}{" "}
                    {session.multimedia?.length === 1 ? "recurso" : "recursos"}
                  </Text>
                </View>
              </View>

              {session.descripcion && (
                <Text
                  style={[
                    styles.sessionDescription,
                    index > 0 &&
                      !completedSessions.includes(index - 1) &&
                      styles.lockedSessionText,
                  ]}
                  numberOfLines={2}
                >
                  {session.descripcion}
                </Text>
              )}

              {index > 0 && !completedSessions.includes(index - 1) && (
                <Text style={styles.lockedText}>
                  Completa la sesión {index} para desbloquear
                </Text>
              )}
            </View>

            <MaterialIcons
              name={
                index > 0 && !completedSessions.includes(index - 1)
                  ? "lock-outline"
                  : "chevron-right"
              }
              size={24}
              color={
                index > 0 && !completedSessions.includes(index - 1)
                  ? "#999"
                  : "#6200ee"
              }
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Curso no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.courseImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <View style={styles.courseDetailsOverlay}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {course.titulo || "Título no disponible"}
          </Text>

          <View style={styles.courseMetaContainer}>
            <View style={styles.courseMetaItem}>
              <FontAwesome name="money" size={16} color="#E0E0E0" />
              <Text style={styles.courseMetaValue}>
                {course.precio === 0 ? "Gratis" : `$${course.precio}`}
              </Text>
            </View>
            <View style={styles.courseMetaItem}>
              <MaterialIcons name="category" size={16} color="#E0E0E0" />
              <Text style={styles.courseMetaValue} numberOfLines={1}>
                {course.categoria || "No definida"}
              </Text>
            </View>
          </View>

          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <MaterialIcons name="event-available" size={16} color="#E0E0E0" />
              <Text style={styles.dateText}>
                {course.fechaInicio || "No disponible"}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <MaterialIcons name="event-busy" size={16} color="#E0E0E0" />
              <Text style={styles.dateText}>
                {course.fechaFin || "No disponible"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(course.enrollmentStatus) },
            ]}
          >
            <MaterialIcons
              name={
                course.enrollmentStatus === "Aceptado"
                  ? "check-circle"
                  : course.enrollmentStatus === "Pendiente"
                  ? "pending"
                  : "cancel"
              }
              size={16}
              color="#fff"
            />
            <Text style={styles.statusText}>
              {formatEnrollmentStatus(course.enrollmentStatus)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Descripción</Text>
        <Text style={styles.courseDescription}>
          {course.descripcion || "Sin descripción disponible"}
        </Text>
      </View>

      {renderSessions()}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.continueButton]}
          onPress={() =>
            course.sessions?.length > 0 &&
            handleSessionPress(course.sessions[0], 0)
          }
          disabled={
            !course.sessions?.length || course.enrollmentStatus !== "Aceptado"
          }
        >
          <FontAwesome name="play" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>
            {completedSessions.length > 0 ? "Continuar" : "Comenzar"}
          </Text>
        </TouchableOpacity>
      </View>

      {course.status === "Finalizado" && (
        <RateCourse courseId={course.id} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F4F4" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { fontSize: 18, color: "#F44336", textAlign: "center" },
  imageContainer: { width, height: 350, position: "relative" },
  courseImage: { width: "100%", height: "100%", position: "absolute" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  courseDetailsOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  courseMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  courseMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  courseMetaValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  dateText: { color: "#FFFFFF", fontSize: 14, marginLeft: 8 },
  statusBadge: {
    flexDirection: "row",
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  descriptionContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginTop: 10,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  courseDescription: { fontSize: 16, lineHeight: 24, color: "#666" },
  noSessionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 30,
    margin: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  noSessionsText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  sessionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#444" },
  resetText: { color: "#6200ee", fontSize: 14, fontWeight: "500" },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: 10, color: "#666" },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  lockedSession: { opacity: 0.7, backgroundColor: "#f9f9f9" },
  completedSession: { borderLeftWidth: 4, borderLeftColor: "#4CAF50" },
  sessionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#6200ee",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  lockedSessionNumber: { backgroundColor: "#999" },
  completedSessionNumber: { backgroundColor: "#4CAF50" },
  sessionNumberText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  sessionContent: { flex: 1, marginRight: 10 },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    flex: 1,
  },
  lockedSessionTitle: { color: "#999" },
  sessionMeta: { flexDirection: "row", marginBottom: 5 },
  sessionMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  sessionMetaText: { fontSize: 12, color: "#666", marginLeft: 5 },
  lockedSessionText: { color: "#999" },
  sessionDescription: { fontSize: 13, color: "#777", lineHeight: 18 },
  lockedText: {
    fontSize: 12,
    color: "#F44336",
    marginTop: 5,
    fontStyle: "italic",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  backButton: { backgroundColor: "#757575" },
  continueButton: { backgroundColor: "#6200ee" },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  // Nuevos estilos añadidos
  loadingIndicator: { position: "absolute", right: 10, zIndex: 1 },
  chevronIcon: { marginLeft: 10 },
});

export default StudentCourse;
