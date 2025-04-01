import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getUserById, requestEnrollment } from "../../../config/authService";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as IntentLauncher from "expo-intent-launcher";
import { jsPDF } from "jspdf";
import "react-native-get-random-values";
import { encode } from "base-64"; // Añadir este import
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PayCourse({ route, navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const { course } = route.params;

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

  const generatePaymentPDF = async () => {
    try {
      const doc = new jsPDF();
      const referenceNumber = uuidv4().replace(/-/g, "").slice(0, 16);
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);

      // Configuración inicial
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Instrucciones de Pago", 20, 25);

      // Línea decorativa
      doc.setDrawColor(79, 175, 80);
      doc.setLineWidth(1);
      doc.line(20, 30, 190, 30);

      // Datos principales
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");

      const yStart = 40;
      let yPosition = yStart;

      // Sección de monto
      doc.setFontSize(14);
      doc.text(
        `Monto a pagar: $${course.precio.toFixed(2)} MXN`,
        20,
        yPosition
      );
      yPosition += 15;

      // Datos bancarios
      doc.setFontSize(12);
      const bankDetails = [
        "Banco: Citibanamex (Banamex)",
        "Beneficiario: EduHubInc S.A. de C.V.",
        "CLABE: 0021 8000 1234 5678 90",
        "Cuenta: 9876543210",
        `Referencia: ${referenceNumber}`,
        `Fecha de vencimiento: ${course.fechaInicio}`,
      ];

      bankDetails.forEach((line, index) => {
        doc.text(line, 20, yPosition + index * 8);
      });
      yPosition += bankDetails.length * 8 + 15;

      // Notas importantes
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "* Este documento es válido hasta la fecha de vencimiento indicada",
        20,
        yPosition
      );
      doc.text(
        "* La referencia de pago es única e intransferible",
        20,
        yPosition + 5
      );

      // Generar PDF como base64
      const pdfBase64 = doc.output("datauristring").split(",")[1];

      // Guardar PDF
      const pdfName = `Pago_EduHub_${referenceNumber}.pdf`;
      const pdfPath = `${FileSystem.documentDirectory}${pdfName}`;

      await FileSystem.writeAsStringAsync(pdfPath, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Obtener URI compatible con Android
      let pdfUri = pdfPath;
      if (Platform.OS === "android") {
        const contentUri = await FileSystem.getContentUriAsync(pdfPath);
        pdfUri = contentUri;
      }

      // Verificar si el archivo existe
      const fileInfo = await FileSystem.getInfoAsync(pdfPath);
      if (!fileInfo.exists) {
        throw new Error("El archivo PDF no se generó correctamente");
      }

      // Abrir PDF
      // Abrir PDF
      if (Platform.OS === "android") {
        try {
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: pdfUri,
              flags: 1,
              type: "application/pdf",
            }
          );
        } catch (error) {
          if (error.message.includes("No Activity found")) {
            Alert.alert(
              "Error",
              "No hay una aplicación para ver PDFs instalada. Instala un visor de PDFs como Adobe Acrobat o Google PDF Viewer"
            );
          } else {
            throw error;
          }
        }
      } else {
        await Linking.openURL(pdfUri);
      }
    } catch (error) {
      console.error("Error generando PDF:", error);
      Alert.alert("Error", error.message || "No se pudo generar el PDF");
    }
  };

  const verifyPermissions = async () => {
    if (Platform.OS === "android") {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permisos requeridos",
          "Necesitamos acceso a tus archivos para subir comprobantes"
        );
        return false;
      }
    }
    return true;
  };

  const pickDocument = async () => {
    try {
      const hasPermission = await verifyPermissions();
      if (!hasPermission) return;

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];

        let accessibleUri = file.uri;
        if (Platform.OS === "android") {
          accessibleUri = await FileSystem.getContentUriAsync(file.uri);
        }

        setSelectedFile({
          name: file.name,
          size: file.size,
          uri: accessibleUri,
          mimeType: file.mimeType,
          originalUri: file.uri,
        });

        if (file.mimeType?.startsWith("image/")) {
          setFilePreview(accessibleUri);
        } else {
          setFilePreview(null);
        }

        await handleUploadAndOpen(
          accessibleUri,
          file.mimeType,
          file.name,
          file.size
        );
      }
    } catch (err) {
      console.error("Error al seleccionar documento:", err);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  const handleUploadAndOpen = async (uri, mimeType, fileName, fileSize) => {
    try {
      setUploadStatus("uploading");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUploadStatus("success");
    } catch (err) {
      console.error("Error en la subida:", err);
      setUploadStatus("error");
      Alert.alert("Error", err.message || "No se pudo completar la subida");
    }
  };
  const handleEnrollment = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "Debes seleccionar un comprobante");
      return;
    }

    try {
      setUploadStatus("uploading");
      const studentId = await AsyncStorage.getItem("userId");
      const result = await requestEnrollment(course.id, studentId, selectedFile);

      if (result.success) {
        Alert.alert("Éxito", result.message, [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Alert.alert("Error en pay course", error.message);
      setUploadStatus("error");
    } finally {
      setUploadStatus(null);
    }
  };

  const openDocument = async (uri, mimeType) => {
    try {
      if (Platform.OS === "android") {
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: uri,
          flags: 1,
          type: mimeType || "*/*",
        });
      } else {
        await Linking.openURL(uri);
      }
    } catch (error) {
      console.error("Error al abrir documento:", error);
      Alert.alert(
        "Error",
        "No se pudo abrir el archivo. Instale un visor de PDF."
      );
    }
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return "file-o";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.includes("pdf")) return "picture-as-pdf";
    if (mimeType.includes("word")) return "description";
    if (mimeType.includes("excel")) return "table-chart";
    if (mimeType.includes("powerpoint")) return "slideshow";
    return "insert-drive-file";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]);
  };

  const renderProfileImage = () => {
    if (user?.profileImage) {
      return (
        <Image
          source={{ uri: user.profileImage }}
          style={styles.profileImage}
        />
      );
    } else {
      const initials = user
        ? `${user.name?.charAt(0) || ""}${
            user.surname?.charAt(0) || ""
          }`.toUpperCase()
        : "NA";
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
        <Text style={styles.loadingText}>Cargando datos del docente...</Text>
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {user && (
        <View style={styles.teacherSection}>
          <View style={styles.teacherHeader}>
            <View style={styles.profileContainer}>{renderProfileImage()}</View>
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

      <View style={styles.courseInfoSection}>
        <Text style={styles.title}>{course.titulo}</Text>
        <Text style={styles.description}>{course.descripcion}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <FontAwesome name="money" size={20} color="#4CAF50" />
            <Text style={styles.detailText}>
              ${course.precio.toLocaleString()}
            </Text>
            <TouchableOpacity
              style={styles.pdfButton}
              onPress={generatePaymentPDF}
            >
              <MaterialIcons name="picture-as-pdf" size={24} color="#fff" />
              <Text style={styles.pdfButtonText}>Generar PDF de Pago</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>INSTRUCCIONES PARA EL PAGO</Text>
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>Genera tu PDF de pago</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Realiza la transferencia bancaria
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Sube tu comprobante aquí
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>COMPROBANTE DE PAGO</Text>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickDocument}
          >
            <MaterialIcons name="cloud-upload" size={24} color="#6200ee" />
            <Text style={styles.uploadButtonText}>
              {selectedFile ? "Cambiar archivo" : "Seleccionar archivo"}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <View style={styles.fileSection}>
              <TouchableOpacity
                style={styles.fileContainer}
                onPress={() =>
                  openDocument(selectedFile.uri, selectedFile.mimeType)
                }
              >
                <View style={styles.fileIconContainer}>
                  <MaterialIcons
                    name={getFileIcon(selectedFile.mimeType)}
                    size={40}
                    color="#6200ee"
                  />
                </View>

                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileDetails}>
                    {formatFileSize(selectedFile.size)} •{" "}
                    {selectedFile.mimeType || "Tipo desconocido"}
                  </Text>
                </View>

                <MaterialIcons name="chevron-right" size={24} color="#6200ee" />
              </TouchableOpacity>
            </View>
          )}

          {uploadStatus === "uploading" && (
            <View style={[styles.statusContainer, styles.uploadingStatus]}>
              <ActivityIndicator size="small" color="#6200ee" />
              <Text style={styles.statusText}>Subiendo archivo...</Text>
            </View>
          )}

          {uploadStatus === "success" && (
            <View style={[styles.statusContainer, styles.successStatus]}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.statusText}>¡Subida exitosa!</Text>
            </View>
          )}

          {uploadStatus === "error" && (
            <View style={[styles.statusContainer, styles.errorStatus]}>
              <MaterialIcons name="error" size={20} color="#f44336" />
              <Text style={styles.statusText}>Error en la subida</Text>
            </View>
          )}
        </View>

        <View style={styles.noteBox}>
          <MaterialIcons name="info-outline" size={24} color="#6200ee" />
          <Text style={styles.noteText}>
            Una vez subido el comprobante, el instructor verificará el pago.
            Recibirás una notificación cuando tu inscripción sea confirmada.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, uploadStatus, styles.buttonDisabled]}
        onPress={handleEnrollment}
      >
        <Text style={styles.buttonText}>{uploadStatus ? "Procesando..." : "Confirmar inscripción"}</Text>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: "#F44336",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  teacherSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  teacherHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#6200ee",
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  profileInitials: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
  },
  teacherInfo: {
    flex: 1,
  },
  teacherLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "bold",
    marginBottom: 4,
    letterSpacing: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginTop: 16,
  },
  courseInfoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: "#444",
    marginLeft: 12,
    fontWeight: "500",
  },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d32f2f",
    padding: 10,
    borderRadius: 8,
    marginLeft: 15,
  },
  pdfButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#888",
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 1,
  },
  instructionsContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  instructionNumberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  instructionText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0e6ff",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d9c7ff",
  },
  uploadButtonText: {
    marginLeft: 10,
    color: "#6200ee",
    fontSize: 16,
    fontWeight: "500",
  },
  fileSection: {
    marginTop: 16,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  fileIconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9e9e9",
    borderRadius: 5,
    marginRight: 16,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  uploadingStatus: {
    backgroundColor: "#e3f2fd",
  },
  successStatus: {
    backgroundColor: "#e8f5e9",
  },
  errorStatus: {
    backgroundColor: "#ffebee",
  },
  statusText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  noteBox: {
    flexDirection: "row",
    backgroundColor: "#f0e6ff",
    borderRadius: 10,
    padding: 16,
    marginTop: 24,
    alignItems: "flex-start",
  },
  noteText: {
    fontSize: 14,
    color: "#6200ee",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#AA39AD",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    margin: 16,
    marginTop: 24,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
