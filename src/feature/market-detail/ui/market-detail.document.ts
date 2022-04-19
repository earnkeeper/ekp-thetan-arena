import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class MarketDetailDocument extends DocumentDto {
  constructor(properties: MarketDetailDocument) {
    super(properties);
  }

  readonly heroName: string;
}
