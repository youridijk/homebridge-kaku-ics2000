import OneFunctionSwitch from './OneFunctionSwitch';
import KAKUPlatform from '../KAKUPlatform';
import {PlatformAccessory} from 'homebridge';

export default class ReloadSwitch extends OneFunctionSwitch {
  constructor(
    platform: KAKUPlatform,
    accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'reload switch');
  }

  /**
   * Rerun the setup on the platform
   */
  protected async onSet() {
    await super.onSet();
    await this.platform.setup();
  }
}
