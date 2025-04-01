import React from 'react';
import { StyleSheet, View } from 'react-native';
import CertificatesItem from '../components/CertificatesItem';

const Certificates = () => {
  return (
    <View style={styles.container}>
      <CertificatesItem />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  }
});

export default Certificates;