
import { OCEAN_LEVEL_UNLOCK_COUNT } from './oceanDepthLevels';
import {
  ALL_OCEAN_COLLECTIBLE_SHELL_IDS,
  ALL_OCEAN_COLLECTIBLE_PEARL_IDS,
} from './oceanZoneCollectibles';

export const OCEAN_DEV_UNLOCK_ALL = __DEV__ && true;


export const OCEAN_DEV_UNLOCK_PATCH = {
  oceanMaxUnlockedLevelIndex: OCEAN_LEVEL_UNLOCK_COUNT - 1,
  oceanDriftModeComplete: true,
  oceanSwimModeComplete: true,
  shellCollectionIds: [...ALL_OCEAN_COLLECTIBLE_SHELL_IDS],
  pearlCollectionIds: [...ALL_OCEAN_COLLECTIBLE_PEARL_IDS],
};
