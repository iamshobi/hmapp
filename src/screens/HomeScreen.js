/**
 * Home — matches HeartMath reference design.
 */
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Settings,
  HelpCircle,
  Lock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  HeartPulse,
  PlayCircle,
  Plus,
  Heart,
} from 'lucide-react-native';
import HomeEcgWave from '../components/HomeEcgWave';
import MoodMeter from '../components/MoodMeter';
import { Logo } from '../components/ui';
import { GradientActionCard } from '../components/ui';
import { colors, spacing, borderRadius, shadows, gradients, palette } from '../theme';
import { styleGuide } from '../theme/styleGuide';
import { useMysession } from '../context/mysessionContext';

const USER_NAME = 'Shobi';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen() {
  const nav = useNavigation();
  const { gentleMode, totalSessions } = useMysession();
  const greeting = useMemo(() => getGreeting(), []);
  const [moodMeterExpanded, setMoodMeterExpanded] = useState(false);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero gradient header ── */}
        <LinearGradient
          colors={gradients.shellHeader}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={styles.headerBg}
        >
          <HomeEcgWave />
          <SafeAreaView edges={['top']} style={styles.safeTop}>
            <View style={styles.topRow}>
              {/* Logo + wordmark */}
              <View style={styles.brandRow}>
                <Logo size={36} />
                <Text style={styles.wordmark}>HeartMath</Text>
              </View>

              {/* Icon tray */}
              <View style={styles.topIcons}>
                <TouchableOpacity
                  hitSlop={12}
                  onPress={() => Alert.alert('Favorites', 'Saved sessions will appear here.')}
                  style={styles.iconBtn}
                >
                  <Plus size={20} color="rgba(255,255,255,0.95)" strokeWidth={2.5} />
                  <Heart
                    size={11}
                    color="rgba(255,255,255,0.95)"
                    fill="rgba(255,255,255,0.95)"
                    style={styles.iconHeart}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={12}
                  onPress={() => Alert.alert('Settings', 'Settings coming soon.')}
                  style={[styles.iconBtn, styles.settingsBadge]}
                >
                  <Settings size={20} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Greeting */}
            <Text style={styles.greeting}>
              {greeting}, {USER_NAME}!
            </Text>
            <Text style={styles.greetingSub}>Your First Step</Text>
            {gentleMode ? (
              <View style={styles.gentlePill}>
                <Text style={styles.gentlePillText}>Gentle mode · 2 min Recovery Breath</Text>
              </View>
            ) : null}
          </SafeAreaView>
        </LinearGradient>

        {/* ── Hero card overlapping the gradient ── */}
        <View style={styles.cardOverlap}>
          <View style={[styles.heroCard, shadows.cardLift]}>
            <Text style={styles.heroMeta}>Getting Started • 5 min</Text>
            <Text style={styles.heroTitle}>Measure Your Heart Coherence</Text>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => nav.navigate('Measure')}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={gradients.ctaPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startBtnGrad}
              >
                <Text style={styles.startBtnText}>Start Here</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.moodMeterHeader}
            onPress={() => setMoodMeterExpanded((prev) => !prev)}
            activeOpacity={0.86}
          >
            <Text style={styles.moodMeterHeaderTitle}>Mood meter</Text>
            {moodMeterExpanded ? (
              <ChevronUp size={20} color={styleGuide.borderBrand} strokeWidth={2.2} />
            ) : (
              <ChevronDown size={20} color={styleGuide.borderBrand} strokeWidth={2.2} />
            )}
          </TouchableOpacity>
          {moodMeterExpanded ? <MoodMeter compact={false} demoApril2026={false} /> : null}
        </View>

        {/* ── Daily Practice ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>Daily Practice</Text>
              <Text style={styles.sectionSub}>Choose how to train today</Text>
            </View>
            <TouchableOpacity
              hitSlop={12}
              style={styles.helpBtn}
              onPress={() => Alert.alert('Daily Practice', 'Pick Learn, Measure, or Play to begin.')}
            >
              <HelpCircle size={22} color={styleGuide.borderBrand} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>

          <View style={styles.practiceRow}>
            <GradientActionCard
              title="Learn"
              gradient="learn"
              icon={<BookOpen size={28} color="#FFFFFF" strokeWidth={1.6} />}
              onPress={() => nav.navigate('Learn')}
            />
            <GradientActionCard
              title="Measure"
              gradient="measure"
              icon={<HeartPulse size={28} color="#FFFFFF" strokeWidth={1.6} />}
              onPress={() => nav.navigate('Measure')}
            />
            <GradientActionCard
              title="Play"
              gradient="play"
              icon={<PlayCircle size={28} color="#FFFFFF" strokeWidth={1.6} />}
              onPress={() => nav.navigate('Play', { screen: 'PlayThemes' })}
            />
          </View>
        </View>

        {/* ── Utility row: Unlock + Full History ── */}
        <View style={styles.utilityRow}>
          <TouchableOpacity
            style={styles.unlockBtn}
            onPress={() => Alert.alert('Unlock App', 'Subscription options will appear here.')}
            activeOpacity={0.88}
          >
            <Lock size={16} color={styleGuide.borderBrand} strokeWidth={2.2} />
            <Text style={styles.unlockText}> Unlock App</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => nav.navigate('MyProgress')}
            style={styles.historyLink}
            hitSlop={8}
          >
            <Text style={styles.historyText}>Full History</Text>
            <ChevronRight size={17} color={styleGuide.borderBrand} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <SafeAreaView edges={['bottom']} style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: styleGuide.shellBackground },
  scrollContent: { paddingBottom: spacing.xxl },

  /* header */
  headerBg: {
    paddingBottom: spacing.xxxl + spacing.xl,
  },
  safeTop: { paddingHorizontal: spacing.lg },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  topIcons: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  iconHeart: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  settingsBadge: {
    backgroundColor: palette.blueBright,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.15,
    marginBottom: spacing.xs,
  },
  gentlePill: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  gentlePillText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  greetingSub: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.86)',
    marginBottom: spacing.sm,
  },

  /* hero card overlap */
  cardOverlap: {
    marginTop: -(spacing.xxxl),
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  heroMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: styleGuide.textHeading,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  startBtn: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  startBtnGrad: {
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* sections */
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  moodMeterHeader: {
    minHeight: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(122,63,107,0.18)',
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  moodMeterHeaderTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: styleGuide.textHeading,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: styleGuide.textHeading,
    marginBottom: 3,
  },
  sectionSub: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  helpBtn: {
    marginTop: 2,
  },
  practiceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  /* utility */
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: styleGuide.borderBrand,
    backgroundColor: styleGuide.shellBackground,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: '700',
    color: styleGuide.borderBrand,
  },
  historyLink: { flexDirection: 'row', alignItems: 'center' },
  historyText: {
    fontSize: 14,
    fontWeight: '700',
    color: styleGuide.borderBrand,
    marginRight: 2,
  },

  bottomPad: { minHeight: spacing.md },
});
