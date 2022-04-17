import { formatTemplate, switchCase } from '@earnkeeper/ekp-sdk';
import { HERO_RARITY_MAP } from './constants';

export const RARITY_COLUMN = {
  id: 'rarity',
  format: switchCase('$.rarity', HERO_RARITY_MAP),
};

export const REMAINING_BATTLES_COLUMN = {
  id: 'battlesRemaining',
  format: formatTemplate('{{ battleCap }} / {{ battleCapMax }}', {
    battleCap: '$.battleCap',
    battleCapMax: '$.battleCapMax',
  }),
};
