import Device from './Device';
import Hub from './Hub';
import DeviceData from './DeviceData';

export default class DimDevice extends Device {

  /**
   * Creates a device that can only turn on or off
   * @param hub The Hub you use to control this device
   * @param deviceData The data pulled from the KAKU cloud about this device
   * @param onOffFunction An integer that represents the index for on/off status and the function used to change on/off status
   * Defaults 0 for simple on/off wall sockets
   * @param dimFunction An integer that represents the index for dim level and the function used to change the dim level
   * Defaults 4 for zigbee lightbulb
   */
  public constructor(
    hub: Hub,
    deviceData: DeviceData,
    onOffFunction = 3,
    public readonly dimFunction: number = 4,
  ) {
    super(hub, deviceData, onOffFunction);
  }

  /**
   * Change the dim level for this device
   * @param dimLevel The new dim level
   * @param sendLocal Boolean which indicates whether you want to send the command local using UDP directly to ICS-2000
   * or through the KAKU cloud
   */
  public dim(dimLevel: number, sendLocal: boolean): Promise<void> | null {
    return this.getHub().dimDevice(this.entityId, this.dimFunction, dimLevel, this.isGroup, sendLocal);
  }

  /**
   * Get the current dim level of this device
   */
  public async getDimLevel(): Promise<number> {
    const status = await this.getHub().getDeviceStatus(this.entityId);
    return status[this.dimFunction];
  }
}

module.exports = DimDevice;
