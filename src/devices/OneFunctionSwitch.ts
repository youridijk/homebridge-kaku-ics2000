import KAKUPlatform from '../KAKUPlatform';
import {PlatformAccessory, Service} from 'homebridge';

export default abstract class OneFunctionSwitch {
  protected readonly service: Service;

  constructor(
    protected readonly platform: KAKUPlatform,
    protected readonly accessory: PlatformAccessory,
    public readonly name: string,
  ) {
    this.service = this.accessory.getService(this.platform.Service['Switch']) || this.accessory.addService(this.platform.Service.Switch);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.onGet.bind(this))
      .onSet(this.onSet.bind(this));
  }

  /**
   * Get current state of this switch. This is always false, so reload is always possible
   * @private
   */
  private onGet = () => false;

  /**
   * Rerun the setup on the platform
   * @private
   */
  protected async onSet(){
    this.platform.logger.info(`${this.name} switch pressed`);
  }
}
