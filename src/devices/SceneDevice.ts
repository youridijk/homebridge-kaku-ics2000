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
   * Run this scene
   */
  protected async onSet() {
    await super.onSet();
    try {
      await this.scene.run();
    } catch (e) {
      this.platform.logger.error(`Error running scene with name ${this.name}: ${e}`);
    }
  }
}
