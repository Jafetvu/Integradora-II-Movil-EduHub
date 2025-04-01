import React, { useState, useRef } from 'react';
import { 
  SafeAreaView, 
  ActivityIndicator, 
  StyleSheet, 
  Dimensions,
  Alert,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';

const API_URL = "http://192.168.100.200:8080/eduhub/api/session";
const { width, height } = Dimensions.get('window');

const MediaViewer = ({ route, navigation }) => {
  const { media } = route.params;
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const mediaUrl = `${API_URL}/${media.sessionId}/multimedia/${media.fileId}`;
  const headers = { Authorization: `Bearer ${media.token}` };

  const handleError = (error) => {
    setLoading(false);
    setError(true);
    Alert.alert(
      'Error de carga', 
      `No se pudo cargar el recurso: ${media.name}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const togglePlayback = () => {
    setIsPaused(!isPaused);
  };

  const handleVideoProgress = (data) => {
    const progress = (data.currentTime / data.seekableDuration) * 100;
    setVideoProgress(progress);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="close" size={30} color="white" />
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator 
          size="large" 
          color="#FFF" 
          style={styles.loader}
        />
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>Error al cargar el contenido</Text>
        </View>
      ) : (
        <>
          {media.type.startsWith('image/') ? (
            <FastImage
              style={styles.media}
              source={{
                uri: mediaUrl,
                headers,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable
              }}
              resizeMode={FastImage.resizeMode.contain}
              onLoadEnd={() => setLoading(false)}
              onError={handleError}
            />
          ) : media.type.startsWith('video/') ? (
            <View style={styles.videoContainer}>
              <Video
                ref={videoRef}
                source={{ uri: mediaUrl, headers }}
                style={styles.video}
                paused={isPaused}
                resizeMode="contain"
                controls={false}
                onLoad={() => setLoading(false)}
                onError={handleError}
                onProgress={handleVideoProgress}
              />
              
              <View style={styles.videoControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={togglePlayback}
                >
                  <Icon
                    name={isPaused ? 'play-arrow' : 'pause'}
                    size={40}
                    color="white"
                  />
                </TouchableOpacity>
                
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${videoProgress}%` }]}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.unsupportedContainer}>
              <Icon name="warning" size={50} color="#FFD700" />
              <Text style={styles.unsupportedText}>
                Formato no compatible: {media.type}
              </Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8
  },
  loader: {
    position: 'absolute',
    alignSelf: 'center'
  },
  media: {
    width: width,
    height: height * 0.9,
  },
  videoContainer: {
    width: width,
    height: height * 0.9,
    position: 'relative'
  },
  video: {
    width: '100%',
    height: '100%'
  },
  videoControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20
  },
  controlButton: {
    alignSelf: 'center',
    marginBottom: 15
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: 2
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 20,
    marginTop: 15,
    fontWeight: '600'
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  unsupportedText: {
    color: '#FFD700',
    fontSize: 18,
    marginTop: 15,
    textAlign: 'center'
  }
});

export default MediaViewer;