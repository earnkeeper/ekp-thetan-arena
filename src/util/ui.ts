import {
  Col,
  Div,
  formatCurrency,
  formatPercent,
  formatTemplate,
  Fragment,
  Image,
  not,
  Row,
  Rpc,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { commify } from './rpc/commify.rpc';

export function priceCell(
  priceRpc: Rpc,
  fiatPriceRpc: Rpc,
  colorizeBy?: Rpc,
  image = 'thc.png',
) {
  return row([
    col(),
    col('col-auto pr-0', pubimage(image, '16px')),
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

export function switchRange(rpc: Rpc, ...ranges: any): Rpc {
  return {
    method: 'switchRange',
    params: [rpc, ranges],
  };
}

export function switchElement(condition: Rpc, yes: UiElement, no: UiElement) {
  return Fragment({
    children: [
      Fragment({ when: condition, children: [yes] }),
      Fragment({ when: not(condition), children: [no] }),
    ],
  });
}

export function col(className?: string, children?: UiElement | UiElement[]) {
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

export function pubimage(name: string, height: string) {
  return Image({
    src: formatTemplate(`${process.env.PUBLIC_URL}/images/{{ name }}`, {
      name,
    }),
    height,
  });
}

export function span(content: Rpc, className?: Rpc) {
  return Span({ content, className });
}

export function row(children: UiElement[]) {
  if (!Array.isArray(children)) {
    return row([children]);
  }

  return Row({
    className: 'm-0',
    children,
  });
}

export function fiat(value: Rpc) {
  return formatCurrency(value, '$.fiatSymbol');
}

export function ColoredCircle(props: { color: Rpc; size: number }) {
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

export function profitPerDayCell(daysRpc: string, profitPerDay: string) {
  return row([
    col(
      'col-12',
      span(
        fiat(profitPerDay),
        switchRange(
          profitPerDay,
          [, 0, 'text-danger float-right font-weight-bold font-small-4'],
          [0, , 'text-success float-right font-weight-bold font-small-4'],
        ),
      ),
    ),
    col(
      'col-12',
      span(formatTemplate('{{ days }} days', { days: daysRpc }), 'float-right'),
    ),
  ]);
}

export function profitCell(profitRpc: string, roiRpc: string) {
  return row([
    col(
      'col-12',
      span(
        fiat(profitRpc),
        switchRange(
          profitRpc,
          [, 0, 'text-danger float-right font-weight-bold font-small-4'],
          [0, , 'text-success float-right font-weight-bold font-small-4'],
        ),
      ),
    ),
    col('col-12', span(formatPercent(roiRpc), 'float-right')),
  ]);
}
