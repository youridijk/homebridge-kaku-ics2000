import Hub from './Hub';
import DeviceData from './DeviceData';

/**
 * This class represents a device you can turn on or off
 */
export default class Device {
  public readonly entityId: number;
  public readonly name: string;
  public readonly isGroup: boolean;
  public readonly deviceType: number;
  // The # marks it private in plain js, so JSON.stringify won't see it and prevents circular JSON
  readonly #hub: Hub;

  /**
   * Creates a device that can only turn on or off
   * @param hub The Hub you use to control this device
   * @param deviceData The data pulled from the KAKU cloud about this device
   * @param onOffFunction An integer that represents the index for on/off status and the function used to change on/off status
   * Defaults 0 for simple on/off wall sockets
   */
  public constructor(
    hub: Hub,
    public readonly deviceData: DeviceData,
    public readonly onOffFunction: number = 0,
  ) {
    this.#hub = hub;
    this.entityId = deviceData.data.module.id;
    this.name = deviceData.name;
    this.deviceType = deviceData.device;
    this.isGroup = deviceData.isGroup;
  }

  /**
   * Turn this device on/off
   * @param on Boolean which indicates new on status
   * @param sendLocal Boolean which indicates whether you want to send the command local using UDP directly to ICS-2000
   * or through the KAKU cloud
   */
  public turnOnOff(on: boolean, sendLocal: boolean): Promise<void> {
    return this.#hub.turnDeviceOnOff(this.entityId, on, this.onOffFunction, this.isGroup, sendLocal);
  }

  /**
   * Get the current on/off status of a device
   */
  public async getOnStatus(): Promise<boolean> {
    const status = await this.#hub.getDeviceStatus(this.entityId);
    return status[this.onOffFunction] === 1;
  }

  /**
   * Get the current status of a device in the form of a integer array
   */
  public getStatus(): Promise<number[]> {
    return this.#hub.getDeviceStatus(this.entityId);
  }

  /**
   * Returns the hub used by this device. Methods aren't seen by JSON.stringify,
   * so using a getter here instead of public property to prevent circular JSON
   */
  public getHub(): Hub {
    return this.#hub;
  }
}

module.exports = Device;
