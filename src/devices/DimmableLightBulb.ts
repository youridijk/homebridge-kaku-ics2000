import LightBulb from './LightBulb';
import KAKUPlatform from '../KAKUPlatform';
import {CharacteristicValue, HAPStatus, PlatformAccessory} from 'homebridge';
import {DimDevice} from 'ics-2000';

export default class DimmableLightBulb extends LightBulb {
  public readonly device: DimDevice;
  private readonly maxBrightness: number;

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

    // .setProps({
    //   minValue: 0,
    //   maxValue: this.device.deviceConfig.maxBrightness ?? 255,
    // })
    ;
    this.maxBrightness = this.device.deviceConfig.maxBrightness ?? 255;
  }

  private convertToRange(value: number, currentMax: number, newMax: number) {
    return value / currentMax * newMax;
  }

  private async getBrightness(): Promise<number> {
    try {
      const rawDimLevel = await this.device.getDimLevel();
      const dimLevel = this.convertToRange(rawDimLevel, this.maxBrightness, 100);
      this.logger.debug(`Current brightness for ${this.deviceName}: raw=${rawDimLevel}, range=${dimLevel}`);
      return dimLevel;
    } catch (e) {
      this.logger.error(`Error getting brightness for ${this.deviceName}: ${e}`);
      throw new this.platform.api.hap.HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  private async changeBrightness(newValue: CharacteristicValue): Promise<void> {
    try {
      let newDimLevel = this.convertToRange(newValue as number, 100, this.maxBrightness);
      newDimLevel = Math.round(newDimLevel);
      this.logger.debug(`Brightness changed: ${newDimLevel}`);
      await this.device.dim(newDimLevel, true);
    } catch (e) {
      this.logger.error(`Error changing brightness for ${this.deviceName}: ${e}`);
      throw new this.platform.api.hap.HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }
}
