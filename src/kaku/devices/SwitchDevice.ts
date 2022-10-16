import Device from './Device';
import Hub from '../Hub';
import DeviceData from '../model/DeviceData';
import DeviceConfig from '../model/DeviceConfig';

export default class SwitchDevice extends Device {

  public constructor(
    hub: Hub,
    deviceData: DeviceData,
    deviceConfig: DeviceConfig,
  ) {
    super(hub, deviceData, deviceConfig);

    if(deviceConfig.onOffFunction == null) {
      throw new Error(`On/off function not defined for '${this.deviceData.name}'`);
    }
  }

  /**
   * Turn this device on/off
   * @param on Boolean which indicates new on status
   * @param sendLocal Boolean which indicates whether you want to send the command local using UDP directly to ICS-2000
   * or through the KAKU cloud
   */
  public turnOnOff(on: boolean, sendLocal: boolean): Promise<void> {
    return this.getHub().turnDeviceOnOff(this.entityId, on, this.deviceConfig.onOffFunction!, this.isGroup, sendLocal);
  }

  /**
   * Get the current on/off status of a device
   */
  public async getOnStatus(): Promise<boolean> {
    const status = await this.getStatus();
    return status[this.deviceConfig.onOffFunction!] === 1;
  }

}
