import React from 'react';
import { View, ScrollView, Image, StyleSheet, useWindowDimensions } from 'react-native';

const homePlaceholder = require('../../assets/home-placeholder-latest.png');
const homePlaceholderMeta = Image.resolveAssetSource(homePlaceholder);

export default function HomeScreenRefreshed() {
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 24 },
  placeholderImage: {
    alignSelf: 'stretch',
  },
});
