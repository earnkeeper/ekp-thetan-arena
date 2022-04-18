import {
  Badge,
  Col,
  Div,
  formatAge,
  formatCurrency,
  formatPercent,
  formatTemplate,
  Fragment,
  Icon,
  Image,
  not,
  Row,
  Rpc,
  Span,
  switchCase,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { RARITY_MAP, TROPHY_MAP } from './constants';
import { commify } from './rpc/commify.rpc';

export const RARITY_COLUMN = {
  id: 'rarity',
  value: switchCase('$.rarity', RARITY_MAP),
  width: '100px',
};

export const NAME_COLUMN = {
  id: 'name',
  minWidth: '400px',
  searchable: true,
  sortable: true,
  cell: Row({
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
                        className: 'col-auto pl-0',
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

function ColoredCircle(props: { color: Rpc; size: number }) {
  return Div({
    // @ts-ignore
    style: {
      backgroundColor: props.color,
      width: props.size,
      height: props.size,
    },
    className: 'rounded-circle',
    children: [],
  });
}

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
  cell: thcPriceCell('$.price', '$.priceFiat', '$.profit'),
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
  id: 'profitPerDay',
  title: 'Per Day',
  right: true,
  width: '160px',
  sortable: true,
  cell: thcPriceCell('$.profitPerDay', '$.profitPerDayFiat', '$.profitPerDay'),
};

function thcPriceCell(priceRpc: Rpc, fiatPriceRpc: Rpc, colorizeBy?: Rpc) {
  return row([
    col(),
    col('col-auto pr-0', pubimage('thc.png', '16px')),
    col(
      'col-auto',
      span(
        commify(priceRpc),
        switchRange(
          priceRpc,
          [, 0, 'text-warning float-right font-small-4 font-weight-bold'],
          [0, , 'text-warning float-right font-small-4 font-weight-bold'],
        ),
      ),
    ),
    col(
      'col-12',
      span(
        fiat(fiatPriceRpc),
        colorizeBy
          ? switchRange(
              colorizeBy,
              [, 0, 'text-danger float-right'],
              [0, , 'text-success float-right'],
            )
          : 'float-right',
      ),
    ),
  ]);
}
export const PROFIT_COLUMN = {
  id: 'profit',
  cell: thcPriceCell('$.profit', '$.profitFiat', '$.profit'),
  right: true,
  width: '160px',
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

export const TOTAL_DAYS_COLUMN = {
  id: 'totalDays',
  title: 'Length',
  format: formatTemplate('{{ days }} days', { days: '$.totalDays' }),
  right: true,
  width: '100px',
  sortable: true,
};

export const MIN_WIN_RATE_COLUMN = {
  id: 'breakEvenWinRate',
  title: 'Must Win',
  format: formatPercent('$.breakEvenWinRate'),
  right: true,
  width: '100px',
};

function switchRange(rpc: Rpc, ...ranges: any): Rpc {
  return {
    method: 'switchRange',
    params: [rpc, ranges],
  };
}

function switchElement(condition: Rpc, yes: UiElement, no: UiElement) {
  return Fragment({
    children: [
      Fragment({ when: condition, children: [yes] }),
      Fragment({ when: not(condition), children: [no] }),
    ],
  });
}

function col(className?: string, children?: UiElement | UiElement[]) {
  if (!children) {
    return Col({ children: [] });
  }
  if (!Array.isArray(children)) {
    return col(className, [children]);
  }

  return Col({
    className,
    children,
  });
}

function pubimage(name: string, height: string) {
  return Image({
    src: `${process.env.PUBLIC_URL}/images/${name}`,
    height,
  });
}

function span(content: Rpc, className?: Rpc) {
  return Span({ content, className });
}

function row(children: UiElement[]) {
  if (!Array.isArray(children)) {
    return row([children]);
  }

  return Row({
    children,
  });
}

function fiat(value: Rpc) {
  return formatCurrency(value, '$.fiatSymbol');
}
