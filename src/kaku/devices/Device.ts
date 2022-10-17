import Hub from '../Hub';
import DeviceData from '../model/DeviceData';
import DeviceConfig from '../model/DeviceConfig';

/**
 * This class represents a device you can turn on or off
 */
export default class Device {
  public readonly entityId: number;
  public readonly name: string;
  public readonly isGroup: boolean;
  public readonly deviceType: number;
  public readonly disabled: boolean;
  // The # marks it private in plain js, so JSON.stringify won't see it and prevents circular JSON
  readonly #hub: Hub;

  /**
   * Creates a device that can only turn on or off
   * @param hub The Hub you use to control this device
   * @param deviceData The data pulled from the KAKU cloud about this device
   * @param deviceConfig Data that contains the functions for on/off, dimming and color temp
   */
  public constructor(
    hub: Hub,
    public readonly deviceData: DeviceData,
    public readonly deviceConfig: DeviceConfig,
  ) {
    this.#hub = hub;
    this.entityId = deviceData.data.module.id;
    this.name = deviceData.name;
    this.deviceType = deviceData.device;
    this.isGroup = deviceData.isGroup;
    this.disabled = deviceConfig.disabled ?? false;
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
