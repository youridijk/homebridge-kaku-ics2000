import LightBulb from './LightBulb';
import KAKUPlatform from '../KAKUPlatform';
import {CharacteristicValue, HAPStatus, PlatformAccessory} from 'homebridge';
import DimDevice from '../kaku/devices/DimDevice';

export default class DimmableLightBulb extends LightBulb {
  public readonly device: DimDevice;

  constructor(
    platform: KAKUPlatform,
    accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'Lightbulb');
    this.device = accessory.context.device;

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onGet(this.getBrightness.bind(this))
      .onSet(this.changeBrightness.bind(this))
      // KAKU uses a value from 0 to 255 for the dim value, so we set this as the min en max values

      .setProps({
        minValue: 0,
        maxValue: this.device.deviceConfig.maxBrightness ?? 255,
      });
  }

  private async getBrightness(): Promise<number> {
    try {
      const status = await this.device.getDimLevel();
      if (status == null) {
        this.logger.debug('status for ' + this.deviceName + ' ' + await this.device.getStatus());
      }
      this.logger.debug(`Current brightness for ${this.deviceName}: ${status}`);
      return status;
    } catch (e) {
      this.logger.error(`Error getting brightness for ${this.deviceName}: ${e}`);
      throw new this.platform.api.hap.HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  private async changeBrightness(newValue: CharacteristicValue): Promise<void> {
    try {
      this.logger.debug(`Brightness changed: ${newValue}`);
      // await this.hub.dimDevice(this.deviceId, 4, newValue as number, this.isGroup, true);
      await this.device.dim(newValue as number, true);
    } catch (e) {
      this.logger.error(`Error changing brightness for ${this.deviceName}: ${e}`);
      throw new this.platform.api.hap.HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }
}
