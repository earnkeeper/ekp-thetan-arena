import Bottleneck from 'bottleneck';

export interface AbstractApiOptions {
  readonly name: string;
  readonly limit?: number | Bottleneck.ConstructorOptions;
}

export interface CallWrapperOptions {
  readonly url: string;
  readonly ttl?: number;
}

export abstract class AbstractApiService {}
