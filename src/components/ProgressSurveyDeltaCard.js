import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { X } from 'lucide-react-native';
import { borderRadius, spacing } from '../theme';

const PROGRESS_FONT_REGULAR = 'Sailec-Light';
const PROGRESS_FONT_MEDIUM = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

function fmtNum(v) {
  if (!Number.isFinite(v)) return '0';
  return String(Math.max(1, Math.min(10, Math.round(v))));
}

function deltaFor(metric, before, after) {
  if (!Number.isFinite(before) || !Number.isFinite(after) || before <= 0) return 0;
  const d = metric === 'stress' ? before - after : after - before;
  return Math.round((d / before) * 100);
}

function DeltaTile({ label, before, after, delta, direction }) {
  const isPositive = delta >= 0;
  const arrow = direction === 'down' ? '↓' : '↑';
  const deltaLabel = `${arrow} ${isPositive ? '+' : ''}${delta}%`;
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileVals}>
        {fmtNum(before)} → {fmtNum(after)}
      </Text>
      <View style={[styles.deltaPill, !isPositive && styles.deltaPillNegative]}>
        <Text style={[styles.deltaTxt, !isPositive && styles.deltaTxtNegative]}>{deltaLabel}</Text>
      </View>
    </View>
  );
}

export default function ProgressSurveyDeltaCard({ averages }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const stressBefore = averages?.stressBefore;
  const stressAfter = averages?.stressAfter;
  const energyBefore = averages?.energyBefore;
  const energyAfter = averages?.energyAfter;
  const moodBefore = averages?.moodBefore;
  const moodAfter = averages?.moodAfter;

  return (
    <>
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>What has improved</Text>
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
      <Text style={styles.sub}>User self-reported scores on 1-10 scale</Text>

      <View style={styles.tileRow}>
        <DeltaTile
          label="Stress"
          before={stressBefore}
          after={stressAfter}
          delta={deltaFor('stress', stressBefore, stressAfter)}
          direction="down"
        />
        <DeltaTile
          label="Energy"
          before={energyBefore}
          after={energyAfter}
          delta={deltaFor('energy', energyBefore, energyAfter)}
          direction="up"
        />
        <DeltaTile
          label="Mood"
          before={moodBefore}
          after={moodAfter}
          delta={deltaFor('mood', moodBefore, moodAfter)}
          direction="up"
        />
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
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    padding: spacing.md,
  },
  title: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#2D1B3A',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  helpBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  helpIconImage: {
    width: 26,
    height: 26,
  },
  sub: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    marginTop: 4,
    marginBottom: spacing.md,
    color: '#8A8EA1',
    fontSize: 12,
    lineHeight: 19,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    backgroundColor: '#F8F8FA',
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tileLabel: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#1F2A44',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    marginBottom: 3,
  },
  tileVals: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: '#7C8195',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    marginBottom: 6,
  },
  deltaPill: {
    borderRadius: 999,
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deltaTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#2C9A5F',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  deltaPillNegative: {
    backgroundColor: '#FBEAEC',
  },
  deltaTxtNegative: {
    color: '#C44D62',
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
    lineHeight: 28,
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
    lineHeight: 24,
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
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
