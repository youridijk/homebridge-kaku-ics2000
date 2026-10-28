import type {PlatformConfig} from 'homebridge';
import type {DeviceConfig} from 'ics-2000';

export interface Config extends PlatformConfig {
  email?: string;
  password?: string;
  localBackupAddress?: string;
  discoverMessage?: string;
  entityBlacklist?: number[];
  deviceBlacklist?: number[];
  deviceConfigsOverrides?: Record<number, DeviceConfig>;
  startRESTServer?: boolean;
  RESTServerPort?: number;
  dimmerDebounceTime?: number;
}
