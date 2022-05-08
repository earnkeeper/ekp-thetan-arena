import {
  Col,
  collection,
  Container,
  Datatable,
  Div,
  documents,
  Icon,
  Image,
  isBusy,
  Row,
  Span,
  switchCase,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import {
  col,
  priceCell,
  profitCell,
  profitPerDayCell,
  row,
  winRateForm,
} from '@/util';
import { BoxDocument } from './box.document';

export default function element(): UiElement {
  return Container({
    children: [
      titleRow(),
      instructionsRow(),
      winRateForm(BoxDocument, false),
      tableRow(),
    ],
  });
}

function instructionsRow() {
  return Span({
    className: 'd-block mt-1 mb-2 font-small-4',
    content: 'Check profitability of buying thetan boxes',
  });
}

function titleRow() {
  return Row({
    className: 'mb-2',
    children: [
      Col({
        className: 'col-auto my-auto',
        children: [
          Icon({
            name: 'box',
          }),
        ],
      }),
      Col({
        className: 'col-auto my-auto pl-0',
        children: [
          Span({
            className: 'font-medium-5',
            content: 'Thetan Boxes',
          }),
        ],
      }),
    ],
  });
}

function tableRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'id',
    data: documents(BoxDocument),
    busyWhen: isBusy(collection(BoxDocument)),
    columns: [
      {
        id: 'name',
        cell: row([
          col('col-auto', Image({ src: '$.imageUrl', height: 32 })),
          col('col-auto px-0', [
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
              },
              children: [],
            }),
          ]),
          col(
            'col-auto pr-0',
            Span({ content: '$.name', className: 'font-medium-2' }),
          ),
        ]),
      },
      {
        id: 'cost',
        cell: priceCell('$.cost', '$.costFiat', undefined, '$.costImageUrl'),
        right: true,
        width: '160px',
      },
      {
        id: 'minProfitFiat',
        title: 'Min Profit',
        cell: profitCell('$.minProfitFiat', '$.minRoi'),
        right: true,
        width: '140px',
      },
      {
        id: 'minProfitPerDayFiat',
        title: 'Per Day',
        cell: profitPerDayCell('$.minDays', '$.minProfitPerDayFiat'),
        right: true,
        width: '140px',
      },
      {
        id: 'maxProfitFiat',
        title: 'Max Profit',
        cell: profitCell('$.maxProfitFiat', '$.maxRoi'),
        right: true,
        width: '140px',
      },
      {
        id: 'maxProfitPerDayFiat',
        title: 'Per Day',
        cell: profitPerDayCell('$.maxDays', '$.maxProfitPerDayFiat'),
        right: true,
        width: '140px',
      },
      { id: 'padding', title: '', width: '10px', format: '' },
    ],
  });
}
