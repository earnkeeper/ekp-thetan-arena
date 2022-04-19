import {
  Col,
  Container,
  Image,
  path,
  Row,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { MarketDetailDocument } from './market-detail.document';

export default function element(): UiElement {
  return Container({
    children: [titleRow(), heroRow()],
  });
}

function heroRow() {
  return Span({
    className: 'font-medium-1 d-block',
    content: `${path(MarketDetailDocument)}[0].heroName`,
  });
}

function titleRow() {
  return Row({
    className: 'mb-2',
    children: [
      Col({
        className: 'col-auto my-auto',
        children: [
          Image({
            src: '/plugins/heroes.svg',
          }),
        ],
      }),
      Col({
        className: 'col-auto my-auto pl-0',
        children: [
          Span({
            className: 'font-medium-5',
            content: 'Hero Details',
          }),
        ],
      }),
    ],
  });
}
