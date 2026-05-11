import React from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Settings } from 'lucide-react-native';
import { palette } from '../theme';

const homePlaceholder = require('../../assets/home-landing-target.png');
const homePlaceholderMeta = Image.resolveAssetSource(homePlaceholder);

export default function HomeScreenRefreshed() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const imageHeight = screenWidth * (homePlaceholderMeta.height / homePlaceholderMeta.width);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { minWidth: screenWidth }]}
      >
        <Image
          source={homePlaceholder}
          style={[styles.placeholderImage, { width: screenWidth, height: imageHeight }]}
          resizeMode="contain"
        />
      </ScrollView>
      <View style={[styles.topBarOverlay, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsBtn}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Settings size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 24 },
  placeholderImage: {
    alignSelf: 'stretch',
  },
  topBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    zIndex: 10,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.blueBright,
  },
});
