import Hub from './Hub';
import DeviceData from './model/DeviceData';
import DimDevice from './DimDevice';

export default class ColorTempDevice extends DimDevice {
  public constructor(
    hub: Hub,
    deviceData: DeviceData,
    onOffFunction = 3,
    dimFunction = 4,
    public colorTempFunction: number = 9,
  ) {
    super(hub, deviceData, onOffFunction, dimFunction);
  }

  public changeColorTemperature(colorTemperature: number, sendLocal: boolean): Promise<void> {
    return this.getHub().changeColorTemperature(this.entityId, this.colorTempFunction, colorTemperature, this.isGroup, sendLocal);
  }

  /**
   * Get the current color temperature of this device
   */
  public async getColorTemperature(): Promise<number> {
    const status = await this.getHub().getDeviceStatus(this.entityId);
    return status[this.colorTempFunction];
  }
}

module.exports = ColorTempDevice;
