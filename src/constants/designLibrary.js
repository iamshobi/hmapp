/**
 * HeartMath / Figma Make design library — canonical tokens.
 *
 * Source file: e.g. `Downloads/HM Design Library (1).make` (Figma Make ZIP).
 * `meta.json` `file_name`: HM Design Library.
 * Canvas background RGB ≈ (30,30,30), thumbnail 400×353, render frame 1408×1244.
 *
 * App shell colors/gradients: `src/constants/hmDesignLibrary.tokens.json` → `src/theme.js`.
 * This file only stores Figma Make canvas metadata.
 */

/** Matches `meta.json` `file_name` */
export const DESIGN_LIBRARY_FILE_NAME = 'HM Design Library';

/** Figma file canvas background from design library export */
export const DESIGN_LIBRARY_CANVAS = '#1E1E1E';

/** Thumbnail size in design file */
export const DESIGN_LIBRARY_THUMB = { width: 400, height: 353 };

/** Main artboard size in design file */
export const DESIGN_LIBRARY_FRAME = { width: 1408, height: 1244 };
