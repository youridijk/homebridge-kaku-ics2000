import Hub from '../Hub';
import DeviceData from '../model/DeviceData';
import SwitchDevice from './SwitchDevice';
import DeviceConfig from '../model/DeviceConfig';

export default class DimDevice extends SwitchDevice {
  public constructor(
    hub: Hub,
    deviceData: DeviceData,
    deviceConfig: DeviceConfig,
  ) {
    super(hub, deviceData, deviceConfig);

    if(deviceConfig.dimFunction == null) {
      throw new Error(`Dim function not defined for '${this.deviceData.name}'`);
    }
  }

  /**
   * Change the dim level for this device
   * @param dimLevel The new dim level
   * @param sendLocal Boolean which indicates whether you want to send the command local using UDP directly to ICS-2000
   * or through the KAKU cloud
   */
  public dim(dimLevel: number, sendLocal: boolean): Promise<void> | null {
    return this.getHub().dimDevice(this.entityId, this.deviceConfig.dimFunction!, dimLevel, this.isGroup, sendLocal);
  }

  /**
   * Get the current dim level of this device
   */
  public async getDimLevel(): Promise<number> {
    const status = await this.getHub().getDeviceStatus(this.entityId);
    return status[this.deviceConfig.dimFunction!];
  }
}

module.exports = DimDevice;
