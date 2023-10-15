import {PlatformConfig} from 'homebridge';
import DeviceConfig from 'ics-2000/dist/kaku/model/DeviceConfig';

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
}
