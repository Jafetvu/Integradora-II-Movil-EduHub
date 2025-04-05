import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Messages from "../../../kernel/components/Messages";

const API_URL = "http://192.168.108.41:8080/eduhub/api/session";

const SessionsCourse = ({ route, navigation }) => {
  const { session, courseTitle } = route.params;
  const [loadingFiles, setLoadingFiles] = useState({});
  const [messageData, setMessageData] = useState(null);

  const getImageSource = (uri) => {
    if (!uri) return { uri: "https://via.placeholder.com/300" };
    if (uri.startsWith("http") || uri.startsWith("file")) return { uri };
    return { uri: `data:image/jpeg;base64,${uri}` };
  };

  const showMessage = (title, message, image = null) => {
    setMessageData({ title, message, image });
    setTimeout(() => setMessageData(null), 3000);
  };

  const handleViewFile = async (file) => {
    try {
      setLoadingFiles((prev) => ({ ...prev, [file.id]: true }));
      const token = await AsyncStorage.getItem("authToken");
      let fileUri;

      if (!file.data) {
        // Archivo desde el servidor
        const downloadUrl = `${API_URL}/${session.id}/multimedia/${file.id}`;
        const response = await FileSystem.downloadAsync(
          downloadUrl,
          `${FileSystem.cacheDirectory}${file.fileName}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fileUri = response.uri;
      } else {
        // Archivo en base64
        const base64Data = file.data.split(",")[1] || file.data;
        fileUri = `${FileSystem.cacheDirectory}${file.fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const contentUri = await FileSystem.getContentUriAsync(fileUri);

      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1,
        type: file.fileType,
      });
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", `No se pudo abrir el archivo: ${error.message}`);
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [file.id]: false }));
    }
  };

  const htmlContentStyle = `
    <style>
      body { 
        font-size: 16px; 
        color: #333; 
        padding: 15px; 
        margin: 0; 
        line-height: 1.6;
        font-family: -apple-system, sans-serif;
      }
      img { 
        max-width: 100%; 
        height: auto;
        border-radius: 8px;
        margin: 10px 0;
      }
      a { 
        color: #3B82F6; 
        text-decoration: none;
        font-weight: 500;
      }
      h1, h2, h3 {
        color: #1E293B;
        margin: 15px 0 10px;
      }
      ul, ol {
        padding-left: 25px;
      }
    </style>
  `;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.courseTitle}>{courseTitle}</Text>
        <Text style={styles.sessionTitle}>{session.nameSession}</Text>
      </View>

      {/* Contenido de la sesión */}
      {session.content && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Contenido de la sesión</Text>
          <View style={styles.webviewContainer}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: htmlContentStyle + session.content }}
              style={styles.webview}
              scalesPageToFit={false}
              javaScriptEnabled={true}
              mixedContentMode="compatibility"
            />
          </View>
        </View>
      )}

      {/* Material multimedia */}
      {session.multimedia && session.multimedia.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Material multimedia</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mediaScrollContainer}
          >
            {session.multimedia.map((media, index) => (
              <TouchableOpacity
                key={`${media.id}-${index}`}
                style={styles.mediaItem}
                onPress={() => handleViewFile(media)}
                disabled={loadingFiles[media.id]}
              >
                {loadingFiles[media.id] ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando...</Text>
                  </View>
                ) : (
                  <View style={styles.mediaFile}>
                    <Text style={styles.mediaIcon}>
                      {media.fileType.startsWith("image/")
                        ? "🖼️"
                        : media.fileType === "application/pdf"
                        ? "📄"
                        : media.fileType.includes("word")
                        ? "📝"
                        : media.fileType.includes("excel")
                        ? "📊"
                        : media.fileType.includes("powerpoint")
                        ? "📑"
                        : media.fileType.includes("video")
                        ? "🎥"
                        : media.fileType.includes("audio")
                        ? "🎵"
                        : media.fileType.includes("zip")
                        ? "📦"
                        : "📁"}
                    </Text>
                    <Text style={styles.mediaName} numberOfLines={1}>
                      {media.fileName}
                    </Text>
                    <Text style={styles.mediaType}>
                      {media.fileType.split("/")[1]?.toUpperCase() || "ARCHIVO"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Botón para volver */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Volver a las sesiones</Text>
      </TouchableOpacity>

      {/* Overlay para mensajes */}
      {messageData && (
        <View style={styles.messageOverlay}>
          <Messages
            title={messageData.title}
            message={messageData.message}
            image={messageData.image}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  courseTitle: {
    fontSize: 16,
    color: "#64748B",
    fontFamily: "Inter-Medium",
  },
  sessionTitle: {
    fontSize: 24,
    color: "#0F172A",
    fontFamily: "Inter-Bold",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    color: "#0F172A",
    fontFamily: "Inter-SemiBold",
    marginBottom: 12,
  },
  webviewContainer: {
    height: 400,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  mediaScrollContainer: {
    paddingVertical: 4,
  },
  mediaItem: {
    width: 120,
    height: 140,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mediaFile: {
    alignItems: "center",
    padding: 8,
  },
  mediaIcon: {
    fontSize: 36,
    marginBottom: 8,
    color: "#3B82F6",
  },
  mediaName: {
    fontSize: 12,
    color: "#1E293B",
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
  mediaType: {
    fontSize: 10,
    color: "#64748B",
    fontFamily: "Inter-Regular",
    marginTop: 4,
    textTransform: "uppercase",
  },
  backButton: {
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
  },
  loadingContainer: {
    width: 120,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Inter-Regular",
  },
  messageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});

export default SessionsCourse;
