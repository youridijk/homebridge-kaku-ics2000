import KAKUPlatform from './KAKUPlatform';
import {PlatformAccessory, Service} from 'homebridge';

export default class ReloadSwitch {
  private readonly service: Service;

  constructor(
    private readonly platform: KAKUPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.service = this.accessory.getService(this.platform.Service['Switch']) || this.accessory.addService(this.platform.Service.Switch);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getState.bind(this))
      .onSet(this.reload.bind(this));
  }

  /**
   * Get current state of this switch. This is always false, so reload is always possible
   * @private
   */
  private getState = () => false;

  /**
   * Rerun the setup on the platform
   * @private
   */
  private async reload(){
    this.platform.logger.info('Reload switch pressed');
    await this.platform.setup();
  }
}
