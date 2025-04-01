import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";

const SessionExpiredModal = ({ isVisible, onClose }) => {
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sesión Expirada</Text>
          <Text style={styles.modalMessage}>
            Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
          </Text>
          <Button style={styles.modalButton} title="Cerrar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#AA39AD",
  },
});

export default SessionExpiredModal;