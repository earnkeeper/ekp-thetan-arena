import { col, fiat, row, span, switchRange } from '@/util';
import {
  Col,
  Div,
  formatPercent,
  formatTemplate,
  Image,
  Row,
  Span,
  switchCase,
  UiElement,
} from '@earnkeeper/ekp-sdk';

export default function element(): UiElement {
  return Row({
    children: [
      Col({
        className: 'col-12',
        children: [Span({ content: 'Top Return on Investment' })],
      }),
      Col({
        className: 'col-12',
        children: [marketRow(2)],
      }),
      Col({
        className: 'col-12',
        children: [marketRow(1)],
      }),
      Col({
        className: 'col-12',
        children: [marketRow(0)],
      }),
    ],
  });
}

function marketRow(index: number) {
  return Row({
    context: `$.data[${index}]`,
    className: 'pt-1',
    children: [
      Col({
        children: [nameRow()],
      }),
      Col({
        className: 'col-auto my-auto',
        children: [profitCell('$.profitFiat', '$.roi')],
      }),
    ],
  });
}

function nameRow() {
  return Row({
    children: [
      col(
        'col-auto my-auto',
        Image({
          src: formatTemplate(
            'https://assets.thetanarena.com/skin/avatar/{{ skinId }}.png',
            { skinId: '$.skinId' },
          ),
          height: '32px',
        }),
      ),
      col(
        'col-auto px-0',
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
      ),
      col(
        'col-auto px-0',
        Row({
          className: 'mx-0',
          children: [
            col('col-12 p-0 font-small-4 font-weight-bold', span('$.name')),
            col('col-12 p-0 font-small-1', span('$.skinName')),
          ],
        }),
      ),
    ],
  });
}

export function profitCell(profitRpc: string, roiRpc: string) {
  return row([
    col(
      'col-12',
      span(fiat(profitRpc), 'float-right font-small-4 font-weight-bold'),
    ),
    col(
      'col-12',
      span(
        formatPercent(roiRpc),
        switchRange(
          profitRpc,
          [, 0, 'text-danger float-right font-small-2'],
          [0, , 'text-success float-right font-small-2'],
        ),
      ),
    ),
  ]);
}
