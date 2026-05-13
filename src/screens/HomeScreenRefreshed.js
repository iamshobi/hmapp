import { useCallback, useId, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { ArrowRight, X } from 'lucide-react-native';
import { JourneyPhaseIcon } from '../components/icons/JourneyPhaseIcons';
import { borderRadius, shadows, spacing } from '../theme';

const FONT_REGULAR = 'Sailec-Medium';
const FONT_BOLD = 'Sailec-Bold';

const QUICK_START_CTA_GRADIENT = ['#FFCA70', '#F57C00', '#E65100'];
const QUICK_START_CTA_GRADIENT_LOCATIONS = [0, 0.48, 1];
const PAGE_BG = '#F3F3F5';

const JOURNEY_HERO_CARD_GRADIENT = ['#FFF4EC', '#FFE5CC', '#E9D5F5'];
const JOURNEY_HERO_CARD_GRADIENT_LOCATIONS = [0, 0.48, 1];

const STAGE_CARD_BG = '#FFF5EE';
const STAGE_ICON_TILE_BG = '#F0E4D8';
const STAGE_LABEL_COLOR = '#A67C38';
const STAGE_TEXT = '#2A2218';

const MODAL_CLOSE_SLOT = 24 + spacing.sm * 2;
const MODAL_CONTENT_BELOW_CLOSE = 36;
const MODAL_TITLE_MARGIN_BOTTOM = 36;
const MODAL_STAGE_CARD_GAP = 46;
const JOURNEY_END_CARD_CTA_BOTTOM_SPACE = 36;

const RHYTHM_STAGES = [
  {
    key: '01',
    stageLabel: 'STAGE 01',
    phase: 'Settle',
    title: 'Settle',
    body: 'Calm the nervous system and ground your energy.',
  },
  {
    key: '02',
    stageLabel: 'STAGE 02',
    phase: 'Flow',
    title: 'Flow',
    body: 'Rhythmic breathing to synchronize mind and body.',
  },
  {
    key: '03',
    stageLabel: 'STAGE 03',
    phase: 'Deep',
    title: 'Deep',
    body: 'Expansion and high-capacity oxygen exchange.',
  },
  {
    key: '04',
    stageLabel: 'STAGE 04',
    phase: 'Still',
    title: 'Still',
    body: 'The final peak of retention and mental clarity.',
  },
];

const MODAL_TITLE_VB_W = 340;
const MODAL_TITLE_VB_H = 102;

function IntroducingJourneyGradientTitle() {
  const { width: winW } = useWindowDimensions();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '') || 't';
  const gradId = `modalIntroJourney_${uid}`;
  const horizontalPad = (spacing.lg + 4) * 2;
  const reserveClose = 52;
  const svgW = Math.max(160, winW - horizontalPad - reserveClose);
  const svgH = (svgW * MODAL_TITLE_VB_H) / MODAL_TITLE_VB_W;

  return (
    <View style={[styles.modalTitleGradientWrap, { width: svgW, height: svgH }]}>
      <Svg width={svgW} height={svgH} viewBox={`0 0 ${MODAL_TITLE_VB_W} ${MODAL_TITLE_VB_H}`}>
        <Defs>
          <SvgLinearGradient
            id={gradId}
            x1="0"
            y1="0"
            x2={MODAL_TITLE_VB_W}
            y2={MODAL_TITLE_VB_H}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#FFCA70" />
            <Stop offset="0.48" stopColor="#F57C00" />
            <Stop offset="1" stopColor="#E65100" />
          </SvgLinearGradient>
        </Defs>
        <SvgText
          fill={`url(#${gradId})`}
          fontFamily={FONT_BOLD}
          fontSize="30"
          fontWeight="700"
          x="0"
          y="30"
        >
          Introducing
        </SvgText>
        <SvgText
          fill={`url(#${gradId})`}
          fontFamily={FONT_BOLD}
          fontSize="42"
          fontWeight="700"
          x="0"
          y="88"
        >
          Journey
        </SvgText>
      </Svg>
    </View>
  );
}

function RhythmStagesModal({ visible, onClose, onQuickStartSession }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <LinearGradient
        colors={JOURNEY_HERO_CARD_GRADIENT}
        locations={JOURNEY_HERO_CARD_GRADIENT_LOCATIONS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modalRoot}
      >
        <TouchableOpacity
          style={[
            styles.modalCloseBtn,
            styles.modalCloseAbs,
            { top: insets.top + spacing.sm, right: spacing.lg + 4 },
          ]}
          onPress={onClose}
          hitSlop={14}
          accessibilityRole="button"
          accessibilityLabel="Close"
          activeOpacity={0.75}
        >
          <X size={24} color="#171717" strokeWidth={2.2} />
        </TouchableOpacity>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.modalScrollContent,
            {
              paddingTop:
                insets.top +
                spacing.sm +
                MODAL_CLOSE_SLOT +
                MODAL_CONTENT_BELOW_CLOSE,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
        >
          <View style={styles.modalHeaderWrap}>
            <IntroducingJourneyGradientTitle />
            <Text style={styles.modalHeaderSubtitle}>
              Begin your journey, master your internal state, transitioning from Settle to Still stage.
            </Text>
          </View>
          {RHYTHM_STAGES.map(({ key, stageLabel, phase, title, body }, index) => (
            <View
              key={key}
              style={[
                styles.stageCard,
                shadows.card,
                index < RHYTHM_STAGES.length - 1 && { marginBottom: MODAL_STAGE_CARD_GAP },
              ]}
            >
              <View style={styles.stageIconTile}>
                <JourneyPhaseIcon phase={phase} variant="future" size={22} useOrangeGradient />
              </View>
              <Text style={styles.stageTitle}>{title}</Text>
              <Text style={styles.stageBody}>{body}</Text>
              <Text style={styles.stageFooter}>{stageLabel}</Text>
            </View>
          ))}

          <View style={[styles.journeyEndCardWrap, shadows.card]}>
            <LinearGradient
              colors={JOURNEY_HERO_CARD_GRADIENT}
              locations={JOURNEY_HERO_CARD_GRADIENT_LOCATIONS}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.journeyEndCard}
            >
              <Text style={styles.journeyEndTitle}>Ready to begin?</Text>
              <Text style={styles.journeyEndBody}>
                Start your 5-minute foundational session to calibrate your biometric baseline.
              </Text>
              <TouchableOpacity
                style={styles.journeyCtaOuter}
                onPress={onQuickStartSession}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Quick Start Session"
              >
                <LinearGradient
                  colors={QUICK_START_CTA_GRADIENT}
                  locations={QUICK_START_CTA_GRADIENT_LOCATIONS}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.journeyCta}
                >
                  <Text style={styles.journeyCtaText} numberOfLines={1}>
                    Quick Start Session
                  </Text>
                  <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

export default function HomeScreenRefreshed() {
  const navigation = useNavigation();
  const [discoverModalVisible, setDiscoverModalVisible] = useState(false);
  const [discoverCardExpanded, setDiscoverCardExpanded] = useState(false);

  const onDiscover = useCallback(() => {
    setDiscoverModalVisible(true);
  }, []);

  const onToggleDiscoverCard = useCallback(() => {
    setDiscoverCardExpanded((prev) => !prev);
  }, []);

  const onCloseDiscoverModal = useCallback(() => {
    setDiscoverModalVisible(false);
  }, []);

  const onQuickStartFromJourneyModal = useCallback(() => {
    setDiscoverModalVisible(false);
    navigation.getParent()?.navigate('Measure');
  }, [navigation]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.discoverCardWrap, shadows.card]}>
            <LinearGradient
              colors={JOURNEY_HERO_CARD_GRADIENT}
              locations={JOURNEY_HERO_CARD_GRADIENT_LOCATIONS}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.discoverCardGradient}
            >
              <Pressable
                onPress={onToggleDiscoverCard}
                style={({ pressed }) => [
                  styles.discoverCardPressable,
                  pressed && styles.discoverCardPressablePressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Ready to discover your natural rhythms?"
                accessibilityHint={
                  discoverCardExpanded
                    ? 'Double tap to collapse the card'
                    : 'Double tap to expand the card and show more details'
                }
                accessibilityState={{ expanded: discoverCardExpanded }}
              >
                <Text style={styles.discoverCardTitle} numberOfLines={4}>
                  Ready to discover your natural rhythms?
                </Text>
                {discoverCardExpanded ? (
                  <Text style={styles.discoverCardBody}>
                    We've mapped out a path to help you master your focus through four rhythmic stages.
                  </Text>
                ) : null}
              </Pressable>
              <TouchableOpacity
                style={styles.journeyCtaOuter}
                onPress={onDiscover}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Discover"
              >
                <LinearGradient
                  colors={QUICK_START_CTA_GRADIENT}
                  locations={QUICK_START_CTA_GRADIENT_LOCATIONS}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.journeyCta}
                >
                  <Text style={styles.journeyCtaText}>Discover</Text>
                  <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>

      <RhythmStagesModal
        visible={discoverModalVisible}
        onClose={onCloseDiscoverModal}
        onQuickStartSession={onQuickStartFromJourneyModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg + 4,
    paddingTop: spacing.lg + 8,
    paddingBottom: spacing.xl + 8,
    flexGrow: 1,
  },
  discoverCardWrap: {
    borderRadius: borderRadius.xl,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  discoverCardGradient: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg + 8,
    paddingVertical: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  discoverCardPressable: {
    marginBottom: spacing.xl,
  },
  discoverCardPressablePressed: {
    opacity: 0.92,
  },
  discoverCardTitle: {
    fontFamily: FONT_BOLD,
    fontSize: 20,
    lineHeight: 36,
    fontWeight: '700',
    color: '#241510',
    letterSpacing: -0.3,
    marginBottom: 0,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  discoverCardBody: {
    marginTop: spacing.md,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
    color: '#4A3D35',
    marginBottom: 0,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  modalRoot: {
    flex: 1,
  },
  modalHeaderWrap: {
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
  },
  modalTitleGradientWrap: {
    marginBottom: MODAL_TITLE_MARGIN_BOTTOM,
  },
  modalCloseAbs: {
    position: 'absolute',
    zIndex: 2,
  },
  modalHeaderSubtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: '#5C5650',
    letterSpacing: 0.1,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  modalCloseBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
  },
  modalScrollContent: {
    paddingHorizontal: spacing.lg + 4,
  },
  stageCard: {
    backgroundColor: STAGE_CARD_BG,
    borderRadius: borderRadius.lg,
    padding: spacing.lg + 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(74, 55, 44, 0.08)',
  },
  stageIconTile: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: STAGE_ICON_TILE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stageTitle: {
    fontFamily: FONT_BOLD,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: STAGE_TEXT,
    marginBottom: spacing.sm,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  stageBody: {
    fontFamily: FONT_REGULAR,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: STAGE_TEXT,
    opacity: 0.92,
    marginBottom: spacing.lg,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  stageFooter: {
    fontFamily: FONT_BOLD,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: STAGE_LABEL_COLOR,
    textTransform: 'uppercase',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },

  journeyEndCardWrap: {
    marginTop: MODAL_STAGE_CARD_GAP,
    marginBottom: MODAL_STAGE_CARD_GAP,
    borderRadius: borderRadius.xl,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  journeyEndCard: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg + 8,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + JOURNEY_END_CARD_CTA_BOTTOM_SPACE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  journeyEndTitle: {
    fontFamily: FONT_BOLD,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#241510',
    letterSpacing: -0.35,
    marginBottom: spacing.md,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  journeyEndBody: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
    color: '#4A3D35',
    marginBottom: spacing.xl,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  journeyCtaOuter: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: '100%',
    borderRadius: borderRadius.full,
    ...Platform.select({
      ios: {
        shadowColor: '#8B3D12',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      default: {},
    }),
  },
  journeyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'stretch',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg + 4,
    minHeight: 52,
  },
  journeyCtaText: {
    flexShrink: 1,
    fontFamily: FONT_BOLD,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.12,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});
