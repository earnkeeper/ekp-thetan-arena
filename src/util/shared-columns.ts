import {
  Badge,
  Col,
  Div,
  formatAge,
  formatPercent,
  formatTemplate,
  Icon,
  Image,
  Row,
  Span,
  switchCase,
} from '@earnkeeper/ekp-sdk';
import { RARITY_MAP, TROPHY_MAP } from './constants';
import { commify } from './rpc/commify.rpc';
import {
  col,
  fiat,
  priceCell,
  profitCell,
  profitPerDayCell,
  pubimage,
  row,
  span,
  switchElement,
  switchRange,
} from './ui';

export const RARITY_COLUMN = {
  id: 'rarity',
  value: switchCase('$.rarity', RARITY_MAP),
  width: '100px',
};

export const NAME_COLUMN = {
  id: 'name',
  minWidth: '350px',
  searchable: true,
  sortable: true,
  cell: Row({
    className: 'p-0',
    children: [
      Col({
        className: 'col-auto my-auto',
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
        className: 'col-auto px-0',
        children: [
          Div({
            // @ts-ignore
            style: {
              backgroundColor: switchCase('$.rarity', {
                0: '#59BFFC',
                1: '#A523FA',
                2: '#F5BC30',
              }),
              width: 6,
              height: '100%',
              marginRight: '0.6rem',
            },
            children: [],
          }),
        ],
      }),
      Col({
        className: 'col-auto p-0',
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
                children: [
                  Row({
                    className: 'p-0',
                    children: [
                      Col({
                        className: 'col-auto',
                        children: [Span({ content: '$.name' })],
                      }),
                      Col({
                        className: 'col-auto pl-0',
                        children: [
                          Image({
                            src: formatTemplate(
                              `${process.env.PUBLIC_URL}/images/role/{{ role }}.png`,
                              {
                                role: '$.role',
                              },
                            ),
                            height: '14px',
                          }),
                        ],
                      }),
                      Col({
                        className: 'col-auto px-0',
                        children: [
                          Image({
                            src: formatTemplate(
                              `${process.env.PUBLIC_URL}/images/trophy/{{ trophy }}.png`,
                              {
                                trophy: '$.trophyClass',
                              },
                            ),
                            height: '16px',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
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

export const BATTLES_USED_COLUMN = {
  id: 'battleCap',
  title: 'Battles',
  sortable: true,
  right: true,
  cell: Badge({
    color: '$.battleColor',
    children: [
      Span({
        className: 'font-small-2',
        content: formatTemplate('{{ battlesUsed }}/{{ battleCapMax }}', {
          battlesUsed: '$.battlesUsed',
          battleCapMax: '$.battleCapMax',
        }),
      }),
    ],
  }),

  width: '100px',
};

export const RENT_BATTLES_COLUMN = {
  id: 'battleCap',
  title: 'Battles',
  sortable: true,
  right: true,
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
  sortable: true,
  right: true,
  cell: Badge({
    // @ts-ignore
    color: 'dark',
    children: [
      Span({
        content: '$.level',
      }),
    ],
  }),
};

export const LISTED_COLUMN = {
  id: 'lastModified',
  title: 'Listed',
  format: formatAge('$.lastModified'),
  sortable: true,
  right: true,
  width: '120px',
};

export const COST_COLUMN = {
  id: 'price',
  title: 'Cost',
  right: true,
  width: '160px',
  sortable: true,
  cell: priceCell('$.price', '$.priceFiat', '$.profit'),
};

export const PRICE_PER_BATTLE_COLUMN = {
  id: 'pricePerBattle',
  title: 'Per Battle',
  right: true,
  width: '140px',
  sortable: true,
  cell: switchElement(
    '$.pricePerBattle',
    row([
      col(),
      col('col-auto pr-0', pubimage('thc.png', '16px')),
      col(
        'col-auto',
        span(
          commify('$.pricePerBattle'),
          'float-right font-small-4 font-weight-bold',
        ),
      ),
      col('col-12', span(fiat('$.priceFiatPerBattle'), 'float-right')),
    ]),
    Icon({
      name: 'cil-infinity',
    }),
  ),
};

export const PROFIT_PER_DAY_COLUMN = {
  id: 'profitPerDayFiat',
  title: 'Per Day',
  right: true,
  width: '140px',
  sortable: true,
  cell: profitPerDayCell('$.totalDays', '$.profitPerDayFiat'),
};

export const PROFIT_COLUMN = {
  id: 'profitFiat',
  title: 'Profit',
  cell: profitCell('$.profitFiat', '$.roi'),
  right: true,
  width: '140px',
  sortable: true,
};

export const APR_COLUMN = {
  id: 'apr',
  title: 'APR',
  right: true,
  width: '100px',
  sortable: true,
  cell: Badge({
    color: switchRange('$.apr', [, 0, 'danger'], [0, , 'success']),
    children: [span(formatPercent('$.apr'), 'font-small-2 font-weight-bold')],
  }),
};

export const ROI_COLUMN = {
  id: 'roi',
  title: 'ROI',
  right: true,
  width: '100px',
  sortable: true,
  format: formatPercent('$.roi'),
  cell: Badge({
    color: switchRange('$.roi', [, 100, 'danger'], [100, , 'success']),
    children: [span(formatPercent('$.roi'), 'font-small-2 font-weight-bold')],
  }),
};

export const MIN_WIN_RATE_COLUMN = {
  id: 'breakEvenWinRate',
  title: 'Must Win',
  format: formatPercent('$.breakEvenWinRate'),
  right: true,
  width: '100px',
};
