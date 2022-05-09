import { CacheService, logger } from '@earnkeeper/ekp-sdk-nestjs';

export class RunBuilder {
  constructor(private cacheService: CacheService) {}

  private enableLogErrors = false;
  private skipIfBusyKeyName: string;

  skipIfBusy(keyName: string) {
    this.skipIfBusyKeyName = `BUSY_${keyName}`;
    return this;
  }

  logErrors() {
    this.enableLogErrors = true;
    return this;
  }

  async run(fn: () => PromiseLike<void>) {
    if (this.skipIfBusyKeyName) {
      const isBusy = await this.cacheService.get(this.skipIfBusyKeyName);

      if (isBusy) {
        return;
      }

      await this.cacheService.set(this.skipIfBusyKeyName, true);
    }

    if (this.enableLogErrors) {
      try {
        await Promise.resolve(fn());
      } catch (error) {
        logger.error(error);
        console.error(error);
      } finally {
        if (this.skipIfBusyKeyName) {
          await this.cacheService.del(this.skipIfBusyKeyName);
        }
      }
    } else {
      await Promise.resolve(fn());
      if (this.skipIfBusyKeyName) {
        await this.cacheService.del(this.skipIfBusyKeyName);
      }
    }
  }
}
