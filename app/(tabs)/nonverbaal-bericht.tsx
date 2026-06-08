import { COLORS, getTheme } from '@/constants/colors';
import THEME from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STORAGE_KEY = 'nonverbal_messages';

export default function NonverbaalMessage() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const theme = useMemo(() => getTheme(), []);

  const [text, setText] = useState('');

  const save = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const next = [...current, { id: Date.now().toString(), text }];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      navigation.goBack();
    } catch (err) {
      console.error(err);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topIconsRow}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Terug.png')} style={[styles.iconImage, { tintColor: COLORS.foreground }]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.pageHeader}>
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>Nieuw bericht</Text>
          <Text style={styles.pageSubtitle}>Typ een bericht dat je later kunt tonen</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.textAreaWrap}>
          <TextInput
            multiline
            placeholder="Typ hier je bericht..."
            placeholderTextColor="#CFCFE0"
            style={styles.textArea}
            value={text}
            onChangeText={setText}
          />
        </View>
      </ScrollView>

      <View style={[styles.bottomWrapper, { paddingBottom: insets.bottom }]}> 
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={[styles.modalPrimaryButton, { backgroundColor: theme.color }]} onPress={save}>
            <Text style={styles.modalPrimaryText}>Opslaan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.modalSecondaryText}>Annuleren</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.tabItem} onPress={() => (navigation as any).navigate('Main', { screen: 'Check-in' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('../../assets/icons/Check-in.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => (navigation as any).navigate('Main', { screen: 'Contacten' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('../../assets/icons/Contacten.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Contacten</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => (navigation as any).navigate('Main', { screen: 'Agenda' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('../../assets/icons/Agenda.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => (navigation as any).navigate('Main', { screen: 'Statistieken' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('../../assets/icons/Statistieken.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Statistieken</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<any>({
  container: { flex: 1, backgroundColor: COLORS.white },
  topIconsRow: {
    position: 'absolute',
    top: 56,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  iconButton: { padding: 4 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  iconImage: { width: 20, height: 20, resizeMode: 'contain' },
  pageHeader: {
    marginTop: 120,
    marginBottom: 8,
    paddingHorizontal: 24,
    zIndex: 20,
  },
  titleWrap: { alignItems: 'flex-start' },
  pageTitle: { fontSize: 22, fontWeight: '700', color: COLORS.foreground },
  pageSubtitle: { marginTop: 8, color: COLORS.mutedForeground },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  textAreaWrap: { backgroundColor: COLORS.inputBackground, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, minHeight: 280, borderWidth: 1, borderColor: 'rgba(107,92,231,0.06)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  textArea: { minHeight: 240, textAlignVertical: 'top', fontSize: 16, color: COLORS.foreground, padding: 8 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' },
  modalPrimaryButton: { paddingVertical: 14, borderRadius: 20, paddingHorizontal: 20, backgroundColor: '#6B5CE7', justifyContent: 'center', alignItems: 'center', width: 160 },
  modalPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  modalSecondaryButton: { paddingVertical: 14, borderRadius: 20, paddingHorizontal: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E6E6E9', flex: 1, marginLeft: 12, alignItems: 'center', justifyContent: 'center' },
  modalSecondaryText: { textAlign: 'center', fontWeight: '600', color: '#2D2D3A', fontSize: 16 },
  bottomWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.04)' },
  bottomButtons: { flexDirection: 'row', paddingHorizontal: 24, alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  bottomContainer: { width: '100%', minHeight: THEME.sizes.tabBarHeight, backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: THEME.spacing.s, paddingTop: THEME.spacing.s, paddingBottom: THEME.spacing.m },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  icon: { width: 22, height: 22, resizeMode: 'contain' },
  label: { marginTop: 0, fontSize: 11, fontWeight: '500' },
});
