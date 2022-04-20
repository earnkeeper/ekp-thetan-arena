import { DocumentDto, UiElement } from '@earnkeeper/ekp-sdk';

export class EmbedDocument extends DocumentDto {
  constructor(properties: EmbedDocument) {
    super(properties);
  }

  readonly element: UiElement;
  readonly size: string;
  readonly data: DocumentDto[];
  readonly page: string;
}
