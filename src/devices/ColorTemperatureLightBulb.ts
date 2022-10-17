import LightBulb from './LightBulb';
import ColorTemperatureDevice from '../kaku/devices/ColorTemperatureDevice';
import KAKUPlatform from '../KAKUPlatform';
import {CharacteristicValue, HAPStatus, PlatformAccessory} from 'homebridge';

export default class ColorTemperatureLightBulb extends LightBulb {
  public readonly device: ColorTemperatureDevice;

  constructor(
    platform: KAKUPlatform,
    accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'Lightbulb');
    this.device = accessory.context.device;

    this.service.getCharacteristic(this.platform.Characteristic.ColorTemperature)
      .onGet(this.getColorTemperature.bind(this))
      .onSet(this.changeColorTemperature.bind(this))
      // According to the KAKU python lib
      // https://github.com/Stijn-Jacobs/ICS2000-Python/blob/e4a5116721398907caeef5e616aea59eb2536a89/ics2000/Core.py#L100
      // The color temp is a value from 0 to 600
      .setProps({
        minValue: 0,
        maxValue: this.device.deviceConfig.maxColorTemperature ?? 600,
      });
  }

  private async getColorTemperature(): Promise<number> {
    try {
      const status = await this.device.getColorTemperature();
      this.logger.debug(`Current color temperature for ${this.deviceName}: ${status}`);
      return status;
    } catch (e) {
      this.logger.error(`Error getting color temperature for ${this.deviceName}: ${e}`);
      throw new this.platform.api.hap.HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  private async changeColorTemperature(newValue: CharacteristicValue): Promise<void> {
    try {
      this.logger.debug(`Color temperature changed: ${newValue}`);
      await this.device.changeColorTemperature(newValue as number, true);
    } catch (e) {
      this.logger.error(`Error changing color temperature for ${this.deviceName}: ${e}`);
      throw new this.platform.api.hap.HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }
}
