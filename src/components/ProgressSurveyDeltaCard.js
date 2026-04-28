import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { borderRadius, spacing } from '../theme';

const PROGRESS_FONT_REGULAR = 'Sailec-Medium';
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
  const [isExpanded, setIsExpanded] = useState(false);
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
    <TouchableOpacity style={styles.card} onPress={() => setIsExpanded((prev) => !prev)} activeOpacity={0.92}>
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
        <View style={styles.titleActions}>
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => setIsExpanded((prev) => !prev)}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel={isExpanded ? 'Collapse What has improved' : 'Expand What has improved'}
          >
            {isExpanded ? (
              <ChevronUp size={16} color="#E18B31" strokeWidth={2.4} />
            ) : (
              <ChevronDown size={16} color="#E18B31" strokeWidth={2.4} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {isExpanded ? (
        <>
          <Text style={styles.sub}>User self-reported scores on 1-10 scale</Text>
          <View style={styles.tileRow}>
            <DeltaTile
              label="Stress"
              before={stressBefore}
              after={stressAfter}
              delta={stressDelta}
              direction="down"
            />
            <DeltaTile
              label="Energy"
              before={energyBefore}
              after={energyAfter}
              delta={energyDelta}
              direction="up"
            />
            <DeltaTile
              label="Mood"
              before={moodBefore}
              after={moodAfter}
              delta={moodDelta}
              direction="up"
            />
          </View>
        </>
      ) : (
        <View style={styles.compactRow}>
          <View style={styles.compactItem}>
            <Text style={styles.compactLabel}>Stress</Text>
            <Text style={styles.compactPct}>{`${stressDelta >= 0 ? '+' : ''}${stressDelta}%`}</Text>
          </View>
          <View style={styles.compactItem}>
            <Text style={styles.compactLabel}>Energy</Text>
            <Text style={styles.compactPct}>{`${energyDelta >= 0 ? '+' : ''}${energyDelta}%`}</Text>
          </View>
          <View style={styles.compactItem}>
            <Text style={styles.compactLabel}>Mood</Text>
            <Text style={styles.compactPct}>{`${moodDelta >= 0 ? '+' : ''}${moodDelta}%`}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>

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
    justifyContent: 'space-between',
    minHeight: 28,
    gap: 8,
    marginBottom: 10,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
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
  expandBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sub: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    marginTop: 0,
    marginBottom: spacing.md + 2,
    color: '#171717',
    fontSize: 13,
    lineHeight: 26,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  compactPct: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#2C9A5F',
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '800',
  },
  tile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    backgroundColor: '#F8F8FA',
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tileLabel: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#171717',
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: 3,
  },
  tileVals: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: '#171717',
    fontSize: 13,
    lineHeight: 26,
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
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '800',
  },
  deltaPillNegative: {
    backgroundColor: '#FBEAEC',
  },
  deltaTxtNegative: {
    color: '#2C9A5F',
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
