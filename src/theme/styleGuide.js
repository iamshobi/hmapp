
import hm from '../constants/hmDesignLibrary.tokens.json';

const { brand, neutral, gradients: hmGradients, shell } = hm;

export const styleGuide = {
  shellBackground: shell.fromThemeCss.background,
  textHeading: neutral.darkText.hex,
  textMuted: neutral.mutedText.hex,
  borderBrand: brand.brandPurple.hex,
  surfaceSoft: brand.surfacePurple.hex,
  fillBrand: brand.brandPurple.hex,
  onboardingGradient: hmGradients.brandBackground.stops,
  success: neutral.successGreen.hex,
  focusRing: 'rgba(118, 55, 132, 0.2)',
};
