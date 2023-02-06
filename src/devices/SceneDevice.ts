import OneFunctionSwitch from './OneFunctionSwitch';
import KAKUPlatform from '../KAKUPlatform';
import {PlatformAccessory} from 'homebridge';
import {Scene} from 'ics-2000';

export default class SceneDevice extends OneFunctionSwitch {
  public readonly scene: Scene;

  constructor(
    platform: KAKUPlatform,
    accessory: PlatformAccessory,
  ) {
    const scene = accessory.context.device as Scene;
    super(platform, accessory, scene.name);
    this.scene = scene;

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Klik Aan Klik Uit')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.scene.entityId.toString());
  }

  /**
   * Rerun the setup on the platform
   */
  protected async onSet() {
    await super.onSet();
    await this.scene.run();
  }
}
