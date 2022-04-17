import {
  Col,
  collection,
  Container,
  Datatable,
  documents,
  formatCurrency,
  formatTemplate,
  Image,
  isBusy,
  navigate,
  Row,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
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
    filters: [
      { columnId: 'heroRarityId', type: 'checkbox' },
      { columnId: 'skinName', type: 'checkbox' },
      { columnId: 'level', type: 'checkbox' },
    ],
    columns: [
      { id: 'heroName' },
      { id: 'skinName' },
      { id: 'battleCap' },
      { id: 'heroRarityId' },
      { id: 'battleCapMax' },
      { id: 'trophyClassId' },
      { id: 'skinName' },
      { id: 'level' },
      { id: 'heroRoleId' },
      { id: 'price' },
      {
        id: 'priceFiat',
        format: formatCurrency('$.priceFiat', '$.fiatSymbol'),
      },
    ],
  });
}
