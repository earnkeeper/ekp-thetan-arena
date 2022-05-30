import { CACHE_MARKET_BUY_VIEWERS } from '@/util';
import { DEFAULT_WIN_RATE_FORM } from '@/util/forms';
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
  logger,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { MarketBuyService } from './market-buy.service';
import { MarketBuyDocument } from './ui/market-buy.document';
import page from './ui/market-buy.uielement';

const COLLECTION_NAME = collection(MarketBuyDocument);
const PATH = 'market-buy';

@Injectable()
export class MarketBuyController extends AbstractController {
  constructor(
    clientService: ClientService,
    private apmService: ApmService,
    private cacheService: CacheService,
    private marketplaceService: MarketBuyService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: PATH,
      title: 'Heroes',
      navLink: PATH,
      icon: 'shopping-bag',
    });

    await this.clientService.emitPage(event, {
      id: PATH,
      element: page(),
    });
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    if (PATH !== event?.state?.client?.path) {
      this.removeViewer(event.clientId);
      return;
    }

    this.addViewer(event);

    await this.processClientState(event);
  }

  async processClientState(event: ClientStateChangedEvent) {
    try {
      await this.clientService.emitBusy(event, COLLECTION_NAME);

      const currency = event.state.client.selectedCurrency;
      const form = event.state.forms?.winRate ?? DEFAULT_WIN_RATE_FORM;

      const documents = await this.marketplaceService.getListingDocuments(
        currency,
        form,
      );

      if (!documents?.length) {
        return;
      }

      await this.clientService.emitDocuments(event, COLLECTION_NAME, documents);
    } catch (error) {
      this.apmService.captureError(error);
      logger.error(error);
    } finally {
      await this.clientService.emitDone(event, COLLECTION_NAME);
    }
  }

  async onClientRpc(event: RpcEvent) {
    // Do nothing
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    await this.removeViewer(event.clientId);
  }

  async getViewers(): Promise<ClientStateChangedEvent[]> {
    const viewers = await this.cacheService.get<ClientStateChangedEvent[]>(
      CACHE_MARKET_BUY_VIEWERS,
    );
    return viewers ?? [];
  }

  private async addViewer(event: ClientStateChangedEvent) {
    const viewers = await this.getViewers();

    const newViewers = _.chain(viewers)
      .filter((it) => it.clientId !== event.clientId)
      .push(event)
      .value();

    await this.cacheService.set(CACHE_MARKET_BUY_VIEWERS, newViewers);
  }

  private async removeViewer(clientId: string) {
    const viewers = await this.getViewers();

    const viewerExists = _.some(viewers, (it) => it.clientId === clientId);

    if (viewerExists) {
      const newViewers = viewers.filter((it) => it.clientId !== clientId);

      await this.cacheService.set(CACHE_MARKET_BUY_VIEWERS, newViewers);
    }
  }
}
