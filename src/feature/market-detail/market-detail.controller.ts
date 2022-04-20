import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
  RpcEvent,
} from '@earnkeeper/ekp-sdk';
import {
  AbstractController,
  ApmService,
  CacheService,
  ClientService,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { MarketDetailService } from './market-detail.service';
import { MarketDetailDocument } from './ui/market-detail.document';
import page from './ui/market-detail.uielement';

const COLLECTION_NAME = collection(MarketDetailDocument);
const PATH = 'market-detail';

@Injectable()
export class MarketDetailController extends AbstractController {
  constructor(
    clientService: ClientService,
    private apmService: ApmService,
    private cacheService: CacheService,
    private marketDetailService: MarketDetailService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitPage(event, {
      id: `${PATH}/:marketId`,
      element: page(),
    });
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    if (!event.state.client.path.startsWith(`${PATH}/`)) {
      return;
    }

    const heroId = event.state.client.path.replace(`${PATH}/`, '');
    const currency = event.state.client.selectedCurrency;

    const document = await this.marketDetailService.getHero(currency, heroId);

    await this.clientService.emitDocuments(event, COLLECTION_NAME, [document]);
  }

  async onClientRpc(event: RpcEvent) {
    // Do nothing
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }
}
