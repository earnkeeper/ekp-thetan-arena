import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class EmbedDataDocument extends DocumentDto {
  constructor(properties: EmbedDataDocument) {
    super(properties);
  }

  readonly name: string;
}
