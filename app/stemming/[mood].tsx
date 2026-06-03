import { COLORS, MOOD_OPTIONS, getTheme } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const MOOD_ICON_SOURCES: Record<string, any> = {
    good: require('../../assets/icons/Goed.png'),
    okay: require('../../assets/icons/Minder goed.png'),
    bad: require('../../assets/icons/Niet goed.png'),
    crisis: require('../../assets/icons/Crisis.png'),
};

export default function MoodCheckInScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { mood } = (route.params || {}) as { mood: string };
    const [moodNote, setMoodNote] = useState('');
    const [theme, setTheme] = useState(getTheme());

    const selectedMood = MOOD_OPTIONS.find((m) => m.id === mood);

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('appTheme');
            if (savedTheme) setTheme(getTheme(savedTheme));
        };
        loadTheme();
    }, []);

    if (!selectedMood) {
        (navigation as any).goBack();
        return null;
    }

    const handleSave = async () => {
        try {
            await AsyncStorage.setItem('tempMoodNote', moodNote);
            (navigation as any).navigate('Activiteiten', { mood: selectedMood.id });
        } catch (error) {
            Alert.alert('Error', 'Er is iets misgegaan.');
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoiding}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
            >
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="person" size={20} color={theme.color} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="settings" size={20} color={theme.color} />
                        footer: {
                            paddingHorizontal: 24,
                            paddingBottom: 24,
                            paddingTop: 12,
                        },
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.foreground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hoe voel je je?</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.noteSection}>
                        <Text style={styles.noteLabel}>Wil je er iets over vertellen? (optioneel)</Text>
                        <TextInput
                            value={moodNote}
                            onChangeText={setMoodNote}
                            multiline
                            numberOfLines={4}
                            placeholder="Wat gebeurt er..."
                            placeholderTextColor={COLORS.mutedForeground}
                            style={styles.noteInput}
                        />
                    </View>
                </ScrollView>

                <View style={[styles.moodCardAbsolute, { backgroundColor: selectedMood.bgColor }]}> 
                    <Image
                        source={MOOD_ICON_SOURCES[selectedMood.id]}
                        style={{ width: 72, height: 72, tintColor: selectedMood.color }}
                        resizeMode="contain"
                    />
                    <Text style={[styles.moodCardTitle, { color: COLORS.foreground }]}>Ik voel me {selectedMood.label.toLowerCase()}</Text>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#00C853' }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.buttonText}>TEST OPSLAAN</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardAvoiding: {
        flex: 1,
        position: 'relative',
    },
    topBar: {
        position: 'absolute',
        top: 56,
        left: 24,
        right: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    iconButton: {
        padding: 4,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 7,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.foreground,
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 220,
    },
    moodCard: {
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginBottom: 40,
    },
    moodCardAbsolute: {
        position: 'absolute',
        left: 24,
        right: 24,
        top: 120,
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 7,
    },
    moodCardTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 12,
    },
    noteSection: {
        marginBottom: 28,
    },
    noteLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.foreground,
        marginBottom: 12,
    },
    noteInput: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
        minHeight: 100,
        fontSize: 14,
        color: COLORS.foreground,
        textAlignVertical: 'top',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 12,
    },
    button: {
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },
});
