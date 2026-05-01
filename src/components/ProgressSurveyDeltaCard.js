import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { X, ArrowDown, ArrowUp } from 'lucide-react-native';

const DELTA_GREEN = '#2C9A5F';
const DELTA_GREEN_BG = 'rgba(44, 154, 95, 0.14)';
import { borderRadius, spacing } from '../theme';

const PROGRESS_FONT_REGULAR = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

function deltaFor(metric, before, after) {
  if (!Number.isFinite(before) || !Number.isFinite(after) || before <= 0) return 0;
  const d = metric === 'stress' ? before - after : after - before;
  return Math.round((d / before) * 100);
}

export default function ProgressSurveyDeltaCard({ averages }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const stressBefore = averages?.stressBefore;
  const stressAfter = averages?.stressAfter;
  const energyBefore = averages?.energyBefore;
  const energyAfter = averages?.energyAfter;
  const moodBefore = averages?.moodBefore;
  const moodAfter = averages?.moodAfter;
  const stressDelta = deltaFor('stress', stressBefore, stressAfter);
  const energyDelta = deltaFor('energy', energyBefore, energyAfter);
  const moodDelta = deltaFor('mood', moodBefore, moodAfter);

  return (
    <>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.title}>What has improved?</Text>
            <TouchableOpacity
              style={styles.helpBtn}
              onPress={() => setIsHelpOpen(true)}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel="Learn how survey scores are interpreted"
            >
              <Image
                source={require('../../assets/help-icon-my-progress.png')}
                style={styles.helpIconImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.compactRow}>
          <View style={styles.compactItem}>
            <Text style={styles.compactLabel}>Stress</Text>
            <View style={styles.compactPctRow} accessibilityRole="text">
              <ArrowDown size={14} color={DELTA_GREEN} strokeWidth={2.8} />
              <Text style={styles.compactPct}>{`${stressDelta}%`}</Text>
            </View>
          </View>
          <View style={styles.compactItem}>
            <Text style={styles.compactLabel}>Energy</Text>
            <View style={styles.compactPctRow} accessibilityRole="text">
              <ArrowUp size={14} color={DELTA_GREEN} strokeWidth={2.8} />
              <Text style={styles.compactPct}>{`${energyDelta}%`}</Text>
            </View>
          </View>
          <View style={styles.compactItem}>
            <Text style={styles.compactLabel}>Mood</Text>
            <View style={styles.compactPctRow} accessibilityRole="text">
              <ArrowUp size={14} color={DELTA_GREEN} strokeWidth={2.8} />
              <Text style={styles.compactPct}>{`${moodDelta}%`}</Text>
            </View>
          </View>
        </View>
      </View>

      <Modal visible={isHelpOpen} transparent animationType="slide" onRequestClose={() => setIsHelpOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPopover}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>What has improved</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsHelpOpen(false)}
                activeOpacity={0.84}
                accessibilityRole="button"
                accessibilityLabel="Close help"
              >
                <X size={22} color="#6B2D8B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>
              Stress is inverted - a lower after-score is an improvement. Energy and Mood are ascending - higher is better.
            </Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => setIsHelpOpen(false)} activeOpacity={0.88}>
                <Text style={styles.modalActionBtnTxt}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: spacing.md + 2,
    paddingTop: 16,
    paddingBottom: spacing.md + 2,
  },
  title: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#2C2C2E',
    fontSize: 14,
    lineHeight: 26,
    fontWeight: '800',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
    marginBottom: 10,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  helpBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  helpIconImage: {
    width: 22,
    height: 22,
  },
  compactRow: {
    marginTop: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  compactItem: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    backgroundColor: '#F8F8FA',
    paddingVertical: 12,
    alignItems: 'center',
  },
  compactLabel: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#171717',
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: 3,
  },
  compactPctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: DELTA_GREEN_BG,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    minHeight: 28,
  },
  compactPct: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: DELTA_GREEN,
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalPopover: {
    width: '100%',
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 44,
    paddingTop: 32,
    paddingBottom: 38,
  },
  modalHeaderRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 24,
    paddingLeft: 0,
  },
  modalTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'left',
  },
  modalCloseBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  modalBody: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: '#171717',
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'left',
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  modalActionRow: {
    marginTop: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionBtn: {
    width: 292,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionBtnTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
});
