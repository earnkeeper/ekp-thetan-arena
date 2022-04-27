import {
  Div,
  formatTemplate,
  Image,
  Row,
  switchCase,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { col, profitCell, span } from '../../../util';

export default function element(): UiElement {
  return Row({
    className: 'm-0 px-1',
    context: '$.data[0]',
    children: [
      col('', nameRow()),
      col('col-auto my-auto p-0', profitCell('$.profitFiat', '$.roi')),
    ],
  });
}

function nameRow() {
  return Row({
    className: 'my-1',
    children: [
      col(
        'col-auto my-auto pl-0',
        Image({
          src: formatTemplate(
            'https://assets.thetanarena.com/skin/avatar/{{ skinId }}.png',
            { skinId: '$.skinId' },
          ),
          height: '38px',
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
            col('col-12 p-0 font-small-1', span('$.skinName')),
            col('col-12 p-0 font-medium-2 font-weight-bold', span('$.name')),
          ],
        }),
      ),
    ],
  });
}
