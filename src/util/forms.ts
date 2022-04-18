import {
  Button,
  Col,
  collection,
  Form,
  isBusy,
  Row,
  Select,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import _ from 'lodash';

export const DEFAULT_WIN_RATE_FORM = {
  winRate: '50 %',
  profitableOnly: 'Yes',
};

export type WinRateForm = Readonly<{
  winRate: string;
  profitableOnly: string;
}>;

export function winRateForm(documentType: any): UiElement {
  return Form({
    name: 'winRate',
    schema: {
      type: 'object',
      properties: {
        winRate: 'string',
        profitableOnly: 'string',
      },
      default: DEFAULT_WIN_RATE_FORM,
    },
    children: [
      Row({
        className: 'mb-1',
        children: [
          Col({
            className: 'col-12 col-md-auto',
            children: [
              Select({
                label: 'Expected Win Rate',
                name: 'winRate',
                options: _.range(10, 110, 10).map((it) => `${it} %`),
                minWidth: 120,
              }),
            ],
          }),
          Col({
            className: 'col-12 col-md-auto',
            children: [
              Select({
                label: 'Profitable Only?',
                name: 'profitableOnly',
                options: ['Yes', 'No'],
                minWidth: 80,
              }),
            ],
          }),
          Col({
            className: 'col-12 col-md-auto my-auto',
            children: [
              Button({
                label: 'Update',
                isSubmit: true,
                busyWhen: isBusy(collection(documentType)),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
