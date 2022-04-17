import {
  Badge,
  Col,
  formatCurrency,
  formatTemplate,
  Image,
  Row,
  Span,
  switchCase,
} from '@earnkeeper/ekp-sdk';
import { RARITY_MAP, TROPHY_MAP } from './constants';
import { commify } from './rpc/commify.rpc';

export const RARITY_COLUMN = {
  id: 'rarity',
  value: switchCase('$.rarity', RARITY_MAP),
  width: '100px',
};

export const REMAINING_BATTLES_COLUMN = {
  id: 'battlesRemaining',
  format: formatTemplate('{{ battleCap }} / {{ battleCapMax }}', {
    battleCap: '$.battleCap',
    battleCapMax: '$.battleCapMax',
  }),
};

export const NAME_COLUMN = {
  id: 'name',
  minWidth: '300px',
  searchable: true,
  sortable: true,
  cell: Row({
    children: [
      Col({
        className: 'col-auto my-auto pr-0',
        children: [
          Image({
            src: formatTemplate(
              'https://assets.thetanarena.com/skin/avatar/{{ skinId }}.png',
              { skinId: '$.skinId' },
            ),
            height: '38px',
          }),
        ],
      }),
      Col({
        className: 'col-auto',
        children: [
          Row({
            className: 'm-0',
            children: [
              Col({
                className: 'col-12 p-0 font-small-1',
                children: [Span({ content: '$.skinName' })],
              }),
              Col({
                className: 'col-12 p-0 font-medium-2 font-weight-bold',
                children: [Span({ content: '$.name' })],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
};

export const SKIN_COLUMN = {
  id: 'skinName',
  title: 'Skin',
  minWidth: '200px',
  searchable: true,
};

export const BATTLE_CAP_COLUMN = {
  id: 'battlesRemaining',
  title: 'Battles',
  cell: Badge({
    color: '$.battleColor',
    children: [
      Span({
        className: 'font-small-3 font-weight-normal',
        content: formatTemplate('{{ battleCap }}/{{ battleCapMax }}', {
          battleCap: '$.battleCap',
          battleCapMax: '$.battleCapMax',
        }),
      }),
    ],
  }),
  width: '100px',
};

export const TROPHY_COLUMN = {
  id: 'trophyClass',
  format: switchCase('$.trophyClass', TROPHY_MAP),
  cell: Image({
    src: formatTemplate(
      `${process.env.PUBLIC_URL}/images/trophy/{{ trophy }}.png`,
      {
        trophy: '$.trophyClass',
      },
    ),
    height: '24px',
  }),
  title: 'Trophy',
  width: '80px',
};

export const ROLE_COLUMN = {
  id: 'role',
  value: switchCase('$.rarity', RARITY_MAP),
  cell: Image({
    src: formatTemplate(
      `${process.env.PUBLIC_URL}/images/role/{{ role }}.png`,
      {
        role: '$.role',
      },
    ),
    height: '20px',
  }),
  width: '80px',
};

export const LEVEL_COLUMN = {
  id: 'level',
  width: '70px',
};

export const PRICE_COLUMN = {
  id: 'price',
  width: '180px',
  cell: Row({
    children: [
      Col({
        className: 'col-auto',
        children: [
          Image({
            src: `${process.env.PUBLIC_URL}/images/thc.png`,
            height: '16px',
          }),
        ],
      }),
      Col({
        className: 'col-auto pl-0 my-auto',
        children: [
          Span({
            content: commify('$.price'),
            className: 'font-small-4 font-weight-bold',
          }),
        ],
      }),
      Col({
        className: 'col-auto pr-0 my-auto',
        children: [
          Span({
            content: formatCurrency('$.priceFiat', '$.fiatSymbol'),
          }),
        ],
      }),
    ],
  }),
};
