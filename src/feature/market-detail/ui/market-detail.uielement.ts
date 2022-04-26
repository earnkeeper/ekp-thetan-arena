import {
  Button,
  Container,
  Datatable,
  Div,
  formatPercent,
  formatTemplate,
  Image,
  navigate,
  path,
  Row,
  Rpc,
  Span,
  switchCase,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { col, fiat, priceCell, row, span } from '../../../util';
import { commify } from '../../../util/rpc/commify.rpc';
import { MarketDetailDocument } from './market-detail.document';

export default function element(): UiElement {
  return Container({
    context: `${path(MarketDetailDocument)}[0]`,
    when: `$.id`,
    children: [
      heroRow(),
      Button({
        className: 'mb-2',
        label: 'View on Marketplace',
        onClick: navigate(
          formatTemplate('https://marketplace.thetanarena.com/item/{{ id }}', {
            id: '$.id',
          }),
          true,
          true,
        ),
      }),
      row([detailsRow(), profitTableRow()]),
    ],
  });
}

function heroRow() {
  return Row({
    className: 'mt-2 mb-4',
    children: [
      col(
        'col-12 col-lg-auto mt-2',
        Image({
          src: '$.skinImageAvatar',
          height: '120px',
        }),
      ),
      col('col-auto pr-0 pl-2 mt-2', [
        Div({
          // @ts-ignore
          style: {
            backgroundColor: switchCase('$.rarity', {
              0: '#59BFFC',
              1: '#A523FA',
              2: '#F5BC30',
            }),
            width: 16,
            height: '100%',
            marginRight: '0.6rem',
          },
          children: [],
        }),
      ]),
      col(
        'mt-2',
        row([
          col('col-12', span('$.skinName', 'font-medium-3 py-0 my-0')),
          col('col-12', span('$.heroName', 'font-large-1 font-weight-bold')),
          col('col-12', [
            Div({
              when: '$.price',
              children: [topPriceCell('$.price', '$.priceFiat')],
            }),
            Div({
              when: { not: '$.price' },
              children: [
                Span({
                  className: 'font-medium-3 mt-1 font-weight-bold text-warning',
                  content: 'NOT FOR SALE',
                }),
              ],
            }),
          ]),
        ]),
      ),
    ],
  });
}

function detailsRow() {
  return col(
    'col-12 col-lg-6',
    Datatable({
      showExport: false,
      pagination: false,
      showLastUpdated: false,
      data: '$.details.*',
      columns: [
        {
          id: 'key',
          title: '',
          cell: span('$.key', 'font-small-4'),
        },
        {
          id: 'value',
          title: '',
          cell: span('$.value', 'font-medium-1 float-right'),
          right: true,
        },
      ],
    }),
  );
}

function profitTableRow() {
  return col('col-12 col-lg-6', [
    Div({
      when: '$.price',
      children: [ProfitDataTable({ showProfit: true })],
    }),
    Div({
      when: { not: '$.price' },
      children: [ProfitDataTable({ showProfit: false })],
    }),
  ]);
}

function ProfitDataTable({ showProfit }) {
  return Datatable({
    data: '$.profits.*',
    showExport: false,
    showLastUpdated: false,
    pagination: false,
    columns: [
      {
        id: 'winRate',
        cell: span(
          formatPercent('$.winRate'),
          'font-medium-1 font-weight-bold',
        ),
        minWidth: '60px',
      },
      {
        id: 'profit',
        cell: priceCell('$.profit', '$.profitFiat', '$.profitFiat'),
        right: true,
        width: '160px',
        omit: !showProfit,
      },
      {
        id: 'revenue',
        cell: priceCell('$.revenue', '$.revenueFiat'),
        right: true,
        width: '160px',
      },
      {
        id: 'padding',
        title: '',
        width: '5px',
      },
    ],
  });
}

export function topPriceCell(
  priceRpc: Rpc,
  fiatPriceRpc: Rpc,
  image = 'thc.png',
) {
  return row([
    col('col-auto', [
      row([
        col(
          'col-auto pr-0',
          Div({
            // @ts-ignore
            style: { marginTop: 2 },
            children: [
              Image({
                src: formatTemplate(
                  `${process.env.PUBLIC_URL}/images/{{ name }}`,
                  {
                    name: image,
                  },
                ),
                height: '20px',
              }),
            ],
          }),
        ),
        col(
          'col-auto',
          span(
            commify(priceRpc),
            'text-warning font-medium-3 font-weight-bold',
          ),
        ),
      ]),
      row([
        col(
          'col-12',
          Div({
            // @ts-ignore
            style: { marginTop: 6 },
            children: [span(fiat(fiatPriceRpc), 'font-small-4')],
          }),
        ),
      ]),
    ]),
  ]);
}
