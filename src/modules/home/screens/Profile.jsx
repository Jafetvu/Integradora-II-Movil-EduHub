import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions
} from "react-native";
import { Input, Icon } from "@rneui/themed";
import { logout } from "../../../config/authService";
import AvatarComponent from "../components/AvatarComponent";
import ProfileOptions from "../components/ProfileOptions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { getUserById } from "../../../config/authService";
import EditProfile from "../components/EditProfile";
import EditPassword from "../components/EditPassword";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get('window');

export default function Profile({ route, setIsLoggedIn }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadUserData = async () => {
      const userId = await AsyncStorage.getItem("userId");
      console.log("ID del usuario:", userId);
      if (userId) {
        try {
          const userData = await getUserById(userId);
          setUser(userData);
        } catch (err) {
          setError(err.message);
          showToast("error", "Error", err.message || "Error al cargar los datos del usuario");
        } finally {
          setLoading(false);
        }
      } else {
        setError("No se encontró el ID del usuario");
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      visibilityTime: 3000,
      position: "top",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userId");
      setIsLoggedIn(false);
      showToast("success", "Sesión cerrada", "Has cerrado sesión correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showToast("error", "Error", "No se pudo cerrar sesión");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const handleEditPassword = () => {
    setIsEditingPassword(true);
  };

  const handleCloseEditPassword = () => {
    setIsEditingPassword(false);
  };

  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
    showToast("success", "Perfil actualizado", "Tus datos se han guardado correctamente");
  };

  const handleSavePassword = async (currentPassword, newPassword) => {
    try {
      console.log("Contraseña actual:", currentPassword);
      console.log("Nueva contraseña:", newPassword);
      setIsEditingPassword(false);
      showToast("success", "Contraseña actualizada", "Tu contraseña se ha cambiado correctamente");
    } catch (error) {
      console.error("Error al guardar la contraseña:", error);
      showToast("error", "Error", "No se pudo cambiar la contraseña");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AA39AD" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No se encontraron datos del usuario.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con avatar y botón de editar */}
        <View style={styles.headerContainer}>
          <AvatarComponent userName={user.username} description={user.description} />
          <View style={styles.editButtonContainer}>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={handleEdit}
              hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
            >
              <Icon name="edit" size={20} color="#AA39AD" />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información del perfil */}
        <View style={styles.profileContainer}>
          <View style={styles.inputContainer}>
            <Input
              label="Nombre"
              labelStyle={styles.labelStyle}
              value={user.name || "No especificado"}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              editable={false}
              leftIcon={<Icon name="user" type="font-awesome" size={18} color="#AA39AD" />}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label="Apellidos"
              labelStyle={styles.labelStyle}
              value={user.surname ? `${user.surname} ${user.lastname}` : "No especificado"}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              editable={false}
              leftIcon={<Icon name="users" type="font-awesome" size={18} color="#AA39AD" />}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label="Correo electrónico"
              labelStyle={styles.labelStyle}
              value={user.email || "No especificado"}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              editable={false}
              leftIcon={<Icon name="envelope" type="font-awesome" size={18} color="#AA39AD" />}
            />
          </View>
        </View>

        {/* Opciones de perfil */}
        <ProfileOptions onEditPassword={handleEditPassword} navigation={navigation} />
      </ScrollView>

      {/* Footer con botón de cerrar sesión */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.buttonLogin} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="exit-to-app" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de edición de perfil */}
      <Modal
        visible={isEditing}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseEdit}
      >
        <View style={styles.modalOverlay}>
          <EditProfile
            onClose={handleCloseEdit}
            userData={user}
            onUpdate={handleUpdateUser}
            setIsLoggedIn={setIsLoggedIn}
          />
        </View>
      </Modal>

      {/* Modal de cambio de contraseña */}
      <Modal
        visible={isEditingPassword}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseEditPassword}
      >
        <View style={styles.modalOverlay}>
          <EditPassword
            onClose={handleCloseEditPassword}
            onSave={handleSavePassword}
            userEmail={user.email}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
  },
  retryButton: {
    backgroundColor: "#AA39AD",
    padding: 12,
    borderRadius: 8,
    width: "50%",
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
    width: width - 40,
  },
  editButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  editButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    maxWidth: 100,
  },
  editButtonText: {
    color: "#AA39AD",
    marginLeft: 5,
    fontWeight: "600",
    fontSize: 14,
  },
  profileContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 15,
  },
  labelStyle: {
    color: "#604274",
    marginBottom: 5,
    fontWeight: "600",
    fontSize: 14,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  inputStyle: {
    marginLeft: 10,
    color: "#333",
    fontSize: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  buttonLogin: {
    backgroundColor: "#AA39AD",
    padding: 15,
    borderRadius: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#AA39AD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  logoutIcon: {
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});