import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  RpcEvent,
} from '@earnkeeper/ekp-sdk';
import { AbstractController, ClientService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { EmbedDocument } from './ui/embed.document';
import element from './ui/embed.uielement';

const COLLECTION_NAME = 'embeds';

@Injectable()
export class EmbedController extends AbstractController {
  constructor(
    clientService: ClientService,
    private embedService: EmbedService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    // Do nothing
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    const currency = event.state.client.selectedCurrency;

    const documents = await this.embedService.getEmbedDocuments(currency);

    const embed: EmbedDocument = {
      id: 'tile',
      size: 'tile',
      element: element(),
      data: documents,
      page: 'market-buy',
    };

    await this.clientService.emitDocuments(event, COLLECTION_NAME, [embed]);
  }

  async onClientRpc(event: RpcEvent) {
    // Do nothing
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }
}
