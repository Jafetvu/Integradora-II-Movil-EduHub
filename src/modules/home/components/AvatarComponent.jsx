import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Avatar } from "@rneui/base";

export default function AvatarComponent({ userName, description, profileImage }) {
  // Extraer iniciales del nombre
  const getInitials = (name) => {
    if (!name) return 'NA';
    
    const nameParts = name.split(' ');
    let initials = '';
    
    // Tomar primera letra del primer nombre
    if (nameParts[0]) {
      initials += nameParts[0].charAt(0).toUpperCase();
    }
    
    // Tomar primera letra del apellido si existe
    if (nameParts.length > 1) {
      initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }
    
    return initials || 'NA';
  };

  const initials = getInitials(userName);

  // Si profileImage existe, se valida el prefijo para base64
  const imageUri =
    profileImage && !profileImage.startsWith("data:")
      ? `data:image/png;base64,${profileImage}`
      : profileImage;

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {imageUri ? (
          <Avatar
            rounded
            size="large"
            source={{ uri: imageUri }}
            containerStyle={styles.avatar}
          />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
          {userName || 'Usuario'}
        </Text>
        <Text 
          style={styles.description} 
          numberOfLines={2} 
          ellipsizeMode="tail"
        >
          {description ? description : "No hay descripción"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: '70%',
  },
  avatarContainer: {
    borderRadius: 40,
    overflow: 'hidden',
    marginRight: 16,
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});
