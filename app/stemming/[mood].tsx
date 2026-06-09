import { COLORS, MOOD_OPTIONS, getTheme } from '@/constants/colors';
import THEME from '@/constants/theme';
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

// Layout constants
const HEADER_HEIGHT = 120;
const CARD_MAX_WIDTH = 393;
const FOOTER_BOTTOM = 80;

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
                {/* Fixed header container */}
                <View style={styles.headerContainer} pointerEvents="box-none">
                    <View style={styles.topBar}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
                            <View style={styles.iconCircle}>
                                <Image source={require('../../assets/icons/Profiel.png')} style={[styles.iconImage, { tintColor: theme.color }]} resizeMode="contain" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
                            <View style={styles.iconCircle}>
                                <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} resizeMode="contain" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.headerInner}>
                        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton}>
                            <Image
                                source={require('../../assets/icons/Terug.png')}
                                style={{ width: 24, height: 24, tintColor: COLORS.foreground }}
                            />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Hoe voel je je?</Text>

                        <View style={{ width: 24 }} />
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={[styles.moodCard, { backgroundColor: selectedMood.bgColor }]}> 
                        <Image
                            source={MOOD_ICON_SOURCES[selectedMood.id]}
                            style={[styles.moodIcon, { tintColor: selectedMood.color }]}
                            resizeMode="contain"
                        />
                        <Text style={[styles.moodCardTitle, { color: COLORS.foreground }]}>Ik voel me {selectedMood.label.toLowerCase()}</Text>
                    </View>

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

                <View style={[styles.footer, { paddingBottom: THEME.sizes.tabBarHeight, borderTopWidth: 1, borderColor: '#E0E0E0', backgroundColor: COLORS.white }]}>
                    <TouchableOpacity
                        style={[styles.button, styles.ctaButton]}
                        onPress={handleSave}
                    >
                        <Text style={[styles.buttonText, { color: '#000' }]}>Ga verder</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    keyboardAvoiding: {
        flex: 1,
        position: 'relative',
    },
    topBar: {
        position: 'absolute',
        top: THEME.spacing.l,
        left: THEME.spacing.l,
        right: THEME.spacing.l,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    iconButton: {
        padding: 0,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 7,
    },
    iconImage: {
        width: 24,
        height: 24,
        tintColor: COLORS.foreground,
    },
    
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.foreground,
        flex: 1,
        textAlign: 'left',
        marginLeft: 8,
    },
    /* CONTENT */
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: THEME.spacing.m,
        paddingTop: 172,
        paddingBottom: FOOTER_BOTTOM,
    },
    moodCard: {
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: THEME.spacing.m,
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 24,
        width: '100%',
        maxWidth: CARD_MAX_WIDTH,
    },
    moodIcon: {
        width: 96,
        height: 96,
    },
    moodCardTitle: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 16,
    },
    noteSection: {
        marginTop: 24,
        marginBottom: 28,
        flex: 1,
        justifyContent: 'flex-start',
    },
    noteLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.foreground,
        marginBottom: 12,
    },
    noteInput: {
        backgroundColor: '#F9F8FC',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 20,
        fontSize: 14,
        color: COLORS.foreground,
        textAlignVertical: 'top',
        flex: 1,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        paddingHorizontal: THEME.spacing.m,
        paddingTop: THEME.spacing.s,
        zIndex: 20,
    },

    headerInner: {
        position: 'absolute',
        top: 108,
        left: THEME.spacing.m,
        right: THEME.spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    footer: {
        paddingHorizontal: THEME.spacing.m,
        paddingBottom: 24,
        paddingTop: 12,
    },
    button: {
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
        width: '100%',
    },
    ctaButton: {
        backgroundColor: '#3CA98A',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },
});
