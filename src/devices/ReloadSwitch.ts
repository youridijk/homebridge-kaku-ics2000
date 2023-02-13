import OneFunctionSwitch from './OneFunctionSwitch';
import KAKUPlatform from '../KAKUPlatform';
import {PlatformAccessory} from 'homebridge';

export default class ReloadSwitch extends OneFunctionSwitch {
  constructor(
    platform: KAKUPlatform,
    accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'Reload switch');
  }

  /**
   * Rerun the setup on the platform
   */
  protected async onSet() {
    await super.onSet();
    try {
      await this.platform.setup();
    } catch (e) {
      this.platform.logger.error(`Error running setup after reload switch toggled: ${e}`);
    }
  }
}
