import Hub from '../Hub';
import DeviceData from '../model/DeviceData';
import DimDevice from './DimDevice';
import DeviceConfig from '../model/DeviceConfig';

export default class ColorTempDevice extends DimDevice {
  public constructor(
    hub: Hub,
    deviceData: DeviceData,
    deviceConfig: DeviceConfig,
  ) {
    super(hub, deviceData, deviceConfig);

    if(deviceConfig.colorTemperatureFunction == null) {
      throw new Error(`Color temperature function not defined for '${this.deviceData.name}'`);
    }
  }

  public changeColorTemperature(colorTemperature: number, sendLocal: boolean): Promise<void> {
    return this.getHub()
      .changeColorTemperature(this.entityId, this.deviceConfig.colorTemperatureFunction!, colorTemperature, this.isGroup, sendLocal);
  }

  /**
   * Get the current color temperature of this device
   */
  public async getColorTemperature(): Promise<number> {
    const status = await this.getHub().getDeviceStatus(this.entityId);
    return status[this.deviceConfig.colorTemperatureFunction!];
  }
}

module.exports = ColorTempDevice;
