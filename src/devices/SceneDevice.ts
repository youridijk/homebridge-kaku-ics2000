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
    const scene = accessory.context as Scene;
    super(platform, accessory, scene.name);
    this.scene = scene;
  }

  /**
   * Rerun the setup on the platform
   */
  protected async onSet() {
    await super.onSet();
    await this.scene.run();
  }
}
