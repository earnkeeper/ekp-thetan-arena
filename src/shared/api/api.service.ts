import {
  CacheService,
  EkConfigService,
  logger,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios-https-proxy-fix';
import Bottleneck from 'bottleneck';
import _ from 'lodash';
import moment from 'moment';
import { HeroConfigsDto, MarketListingDto, SkinConfigDto } from './dto';

const BASE_URL = 'https://data.thetanarena.com/thetan/v1';

@Injectable()
export class ApiService {
  constructor(
    private configService: EkConfigService,
    private cacheService: CacheService,
  ) {}

  async fetchLatestMarketListings(
    laterThan: number,
    limit: number,
  ): Promise<MarketListingDto[]> {
    const url = `${BASE_URL}/nif/search?tab=heroes&sort=Latest`;
    const PAGE_SIZE = 50;

    return this.apiBuilder()
      .limit()
      .retry()
      .page(
        (cursor: number) => `${url}&from=${cursor}&size=${PAGE_SIZE}`,
        (response, cursor: number) => {
          const results: MarketListingDto[] = response?.data?.data ?? [];

          const filteredResults = _.chain(results)
            .filter((it) => moment(it.lastModified).unix() >= laterThan)
            .value();

          return {
            results,
            done:
              (!!limit && cursor + PAGE_SIZE >= limit) ||
              filteredResults.length < PAGE_SIZE,
            cursor: cursor + PAGE_SIZE,
          };
        },
        0,
      );
  }

  async fetchHeroConfigs(): Promise<HeroConfigsDto> {
    const url = `${BASE_URL}/hero/feConfigs?configVer=-1`;

    return this.apiBuilder()
      .limit()
      .retry()
      .cache(3600)
      .get(url, (response) => response?.data?.data);
  }

  async fetchHeroSkinConfigs(): Promise<SkinConfigDto[]> {
    const url = `${BASE_URL}/skin/configs`;

    return this.apiBuilder()
      .limit()
      .retry()
      .cache(3600)
      .get(url, (response) => response?.data?.data);
  }

  private apiBuilder() {
    return new ApiBuilder(this.configService, this.cacheService, {
      defaultLimit: {
        id: 'thetan-api',
        maxConcurrent: 5,
        reservoir: 5,
        reservoirRefreshAmount: 5,
        reservoirRefreshInterval: 1000,
      },
    });
  }
}

class ApiBuilder {
  constructor(
    private configService: EkConfigService,
    private cacheService: CacheService,
    private options?: { defaultLimit: Bottleneck.ConstructorOptions },
  ) {}

  private limiter: Bottleneck;
  private ttl: number;

  proxy() {
    return this;
  }

  limit(limitOptions?: Bottleneck.ConstructorOptions) {
    let options: Bottleneck.ConstructorOptions =
      limitOptions ?? this.options.defaultLimit;

    if (!!options.id) {
      options = {
        ...options,
        datastore: 'ioredis',
        clientOptions: {
          host: this.configService.redisHost,
          port: this.configService.redisPort,
          username: this.configService.redisUser,
          password: this.configService.redisPassword,
        },
        clearDatastore: true,
      };
    }

    this.limiter = new Bottleneck(options);

    return this;
  }

  retry() {
    return this;
  }

  cache(ttl: number) {
    this.ttl = ttl;
    return this;
  }

  async get<T>(
    url: string,
    handler: (response: AxiosResponse) => T,
  ): Promise<T> {
    if (!!this.ttl) {
      const cachedValue = await this.cacheService.get<T>(url);
      if (cachedValue !== null && cachedValue !== undefined) {
        return cachedValue;
      }
    }

    logger.debug(`${url}`);

    const getter = async (url: string) => {
      const response = await axios.get(url);

      const result = await handler(response);

      if (!!this.ttl) {
        await this.cacheService.set(url, result, { ttl: this.ttl });
      }

      return result;
    };

    if (!!this.limiter) {
      return this.limiter.schedule(getter, url);
    }

    return getter(url);
  }

  async page<T>(
    urlMapper: (cursor: string | number) => string,
    handler: (
      response: AxiosResponse,
      cursor: string | number,
    ) => {
      cursor: string | number;
      results: T[];
      done: boolean;
    },
    initialCursor?: string | number,
  ): Promise<T[]> {
    let cursor = initialCursor;
    const results = [];

    while (true) {
      const url = urlMapper(cursor);
      const next = await this.get(url, (response) => handler(response, cursor));

      results.push(...next.results);

      if (next.done) {
        return results;
      }

      cursor = next.cursor;
    }
  }
}
