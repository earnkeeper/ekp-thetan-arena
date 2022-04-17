import {
  Col,
  collection,
  Container,
  Datatable,
  documents,
  formatTemplate,
  Image,
  isBusy,
  navigate,
  Row,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import {
  BATTLE_CAP_COLUMN,
  LEVEL_COLUMN,
  NAME_COLUMN,
  PRICE_COLUMN,
  RARITY_COLUMN,
  ROLE_COLUMN,
  SKIN_COLUMN,
  TROPHY_COLUMN,
} from '../../../util';
import { MarketBuyDocument } from './market-buy.document';

export default function element(): UiElement {
  return Container({
    children: [titleRow(), instructionsRow(), marketRow()],
  });
}

function instructionsRow() {
  return Span({
    className: 'd-block mt-1 mb-2 font-small-4',
    content:
      'Search and filter the Thetan Arena marketplace for the heroes with the best ROI. This list updates automatically once every minute and on each sale.',
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
            content: 'Buy Heroes',
          }),
        ],
      }),
    ],
  });
}

function marketRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'priceFiat',
    defaultSortAsc: true,
    data: documents(MarketBuyDocument),
    busyWhen: isBusy(collection(MarketBuyDocument)),
    paginationPerPage: 50,
    onRowClicked: navigate(
      formatTemplate(`https://marketplace.thetanarena.com/item/{{ refId }}`, {
        refId: '$.refId',
      }),
      true,
      true,
    ),
    filters: [{ columnId: 'rarity', type: 'checkbox' }],
    columns: [
      NAME_COLUMN,
      LEVEL_COLUMN,
      BATTLE_CAP_COLUMN,
      TROPHY_COLUMN,
      { ...RARITY_COLUMN, omit: true },
      ROLE_COLUMN,
      PRICE_COLUMN,
      { ...SKIN_COLUMN, omit: true },
    ],
  });
}
