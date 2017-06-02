import { OpaqueToken } from '@angular/core';
import { SmartClientOptions } from 'zetapush-js';
import { ZetaPushClient, ZetaPushConnection } from './core';

export const ZetaPushClientConfig = new OpaqueToken('ZetaPushClientConfig');

export function ZetaPushClientFactory(config: SmartClientOptions): ZetaPushClient {
  return new ZetaPushClient(config);
}

export function ZetaPushConnectionFactory(client: ZetaPushClient): ZetaPushConnection {
  return new ZetaPushConnection(client);
}
