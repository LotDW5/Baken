import React from 'react';
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';

export default function AgendaOverride() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AGENDA-OVERRIDE</Text>
      </View>
      <View style={styles.body}>
        <Text>This is a temporary override component to verify the running bundle.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { marginTop: 120, paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  body: { padding: 24 },
});
