import { CacheService, CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { MarketDetailDocument } from './ui/market-detail.document';

@Injectable()
export class MarketDetailService {
  constructor(
    private cacheService: CacheService,
    private coingeckoService: CoingeckoService,
  ) {}

  async getHero(heroId: string): Promise<MarketDetailDocument> {
    return { id: heroId, heroName: 'Gavin Number 2' };
  }
}
