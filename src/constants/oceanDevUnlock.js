/**
 * Dev-only: full ocean zone list + Drift / Swim / Dive mode unlocks for QA.
 * Set `OCEAN_DEV_UNLOCK_ALL` to false to exercise real progression in development.
 */
import { OCEAN_LEVEL_UNLOCK_COUNT } from './oceanDepthLevels';
import {
  ALL_OCEAN_COLLECTIBLE_SHELL_IDS,
  ALL_OCEAN_COLLECTIBLE_PEARL_IDS,
} from './oceanZoneCollectibles';

export const OCEAN_DEV_UNLOCK_ALL = __DEV__ && true;

/** Applied on top of persisted mysession data when `OCEAN_DEV_UNLOCK_ALL` is true. */
export const OCEAN_DEV_UNLOCK_PATCH = {
  oceanMaxUnlockedLevelIndex: OCEAN_LEVEL_UNLOCK_COUNT - 1,
  oceanDriftModeComplete: true,
  oceanSwimModeComplete: true,
  shellCollectionIds: [...ALL_OCEAN_COLLECTIBLE_SHELL_IDS],
  pearlCollectionIds: [...ALL_OCEAN_COLLECTIBLE_PEARL_IDS],
};
