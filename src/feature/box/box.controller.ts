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
  LimiterService,
  logger,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { Mutex } from 'redis-semaphore';
import { CACHE_MARKET_BUY_VIEWERS } from '../../util';
import { DEFAULT_WIN_RATE_FORM } from '../../util/forms';
import { BoxService } from './box.service';
import { BoxDocument } from './ui/box.document';
import page from './ui/box.uielement';

const COLLECTION_NAME = collection(BoxDocument);
const PATH = 'boxes';

@Injectable()
export class BoxController extends AbstractController {
  private viewersMutex: Mutex;
  constructor(
    clientService: ClientService,
    limiterService: LimiterService,
    private apmService: ApmService,
    private cacheService: CacheService,
    private marketplaceService: BoxService,
  ) {
    super(clientService);

    this.viewersMutex = limiterService.createMutex(CACHE_MARKET_BUY_VIEWERS);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: PATH,
      title: 'Boxes',
      navLink: PATH,
      icon: 'box',
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

      const documents = await this.marketplaceService.getBoxDocuments(
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
    await this.viewersMutex.acquire();

    try {
      const viewers = await this.getViewers();

      const newViewers = _.chain(viewers)
        .filter((it) => it.clientId !== event.clientId)
        .push(event)
        .value();

      await this.cacheService.set(CACHE_MARKET_BUY_VIEWERS, newViewers);
    } finally {
      await this.viewersMutex.release();
    }
  }

  private async removeViewer(clientId: string) {
    await this.viewersMutex.acquire();

    const viewers = await this.getViewers();

    const viewerExists = _.some(viewers, (it) => it.clientId === clientId);

    if (viewerExists) {
      const newViewers = viewers.filter((it) => it.clientId !== clientId);

      await this.cacheService.set(CACHE_MARKET_BUY_VIEWERS, newViewers);
    }

    await this.viewersMutex.release();
  }
}
