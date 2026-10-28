import LightBulb from './LightBulb';
import KAKUPlatform from '../KAKUPlatform';
import {CharacteristicValue, HAPStatus, PlatformAccessory} from 'homebridge';
import {DimDevice} from 'ics-2000';
import {setTimeout as sleep} from 'node:timers/promises';

// Minimum time between two commands to the same dimmer, so the ics-2000 can finish transmitting the previous one
const COMMAND_INTERVAL = 500;
// HomeKit sends a brightness change in the same request as an on/off change, so an on/off change only waits this long for it
const ON_OFF_DELAY = 50;

export default class DimmableLightBulb extends LightBulb {
  public readonly device: DimDevice;
  private readonly maxBrightness: number;
  private readonly debounceTime: number;

  // Changes received from HomeKit that aren't sent to the ics-2000 yet
  private pendingOn?: boolean;
  private pendingBrightness?: number;
  // The on state before the pending changes, so an on/off command is only sent if the state actually changes
  private previousOn = false;
  private debounceTimer?: NodeJS.Timeout;
  // Commands for this device are chained, so they are never sent at the same time
  private commandQueue: Promise<void> = Promise.resolve();

  constructor(
    platform: KAKUPlatform,
    accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'Lightbulb');
    this.device = accessory.context.device;

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onGet(this.getBrightness.bind(this))
      .onSet(this.changeBrightness.bind(this))
    // KAKU uses a value from 0 to 255 for the dim value, so we set this as the min en max values

    // .setProps({
    //   minValue: 0,
    //   maxValue: this.device.deviceConfig.maxBrightness ?? 255,
    // })
    ;
    this.maxBrightness = this.device.deviceConfig.maxBrightness ?? 255;
    this.debounceTime = this.platform.config.dimmerDebounceTime ?? 500;
  }

  private convertToRange(value: number, currentMax: number, newMax: number) {
    return value / currentMax * newMax;
  }

  private async getBrightness(): Promise<number> {
    try {
      const rawDimLevel = await this.device.getDimLevel();
      const dimLevel = this.convertToRange(rawDimLevel, this.maxBrightness, 100);
      this.logger.debug(`Current brightness for ${this.deviceName}: raw=${rawDimLevel}, range=${dimLevel}`);
      return dimLevel;
    } catch (e) {
      this.logger.error(`Error getting brightness for ${this.deviceName}: ${e}`);
      throw new this.platform.api.hap.HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  /**
   * While dragging the brightness slider, HomeKit sends a stream of brightness changes, often together with an on command.
   * Sending all of them floods the dimmer, and receiving 'on' twice puts a KAKU dimmer in the mode where you set the brightness
   * with a switch. So changes are collected and only the final state is sent once HomeKit stops sending changes.
   * A tap on the on/off button isn't followed by more changes, so that's sent almost right away.
   */
  public async setOn(newValue: CharacteristicValue) {
    this.pendingOn = newValue as boolean;
    this.debounceChange();
  }

  private async changeBrightness(newValue: CharacteristicValue): Promise<void> {
    this.pendingBrightness = newValue as number;
    this.debounceChange();
  }

  private debounceChange() {
    if (this.debounceTimer === undefined) {
      // HomeKit only updates the characteristic after onSet returns, so this is the state before this batch of changes
      this.previousOn = this.service.getCharacteristic(this.platform.Characteristic.On).value as boolean;
    }

    const delay = this.pendingBrightness === undefined ? ON_OFF_DELAY : this.debounceTime;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.sendPendingChanges(), delay);
  }

  private sendPendingChanges() {
    const {pendingOn, pendingBrightness, previousOn} = this;
    this.debounceTimer = undefined;
    this.pendingOn = undefined;
    this.pendingBrightness = undefined;

    // Show the real state in HomeKit when a command fails, so trying again sends the command again
    const revertOn = () => this.service.updateCharacteristic(this.platform.Characteristic.On, previousOn);

    // No need to dim a light that's turned off in the same batch of changes
    if (pendingBrightness !== undefined && pendingOn !== false) {
      // A KAKU dimmer turns on with a dim command, so no on command is sent with it. If the light was turned on without HomeKit
      // knowing it, that on command would put the dimmer in the mode where you set the brightness with a switch
      const dimLevel = Math.round(this.convertToRange(pendingBrightness, 100, this.maxBrightness));
      this.queueCommand(`changing brightness to ${dimLevel}`, async () => {
        await this.device.dim(dimLevel, true);
      }, revertOn);
    } else if (pendingOn !== undefined && pendingOn !== previousOn) {
      this.queueCommand(`changing state to ${pendingOn}`, () => this.device.turnOnOff(pendingOn, true), revertOn);
    }
  }

  private queueCommand(description: string, command: () => Promise<void>, onError?: () => void) {
    this.commandQueue = this.commandQueue.then(async () => {
      try {
        await command();
        this.logger.debug(`Done ${description} on ${this.deviceName}`);
      } catch (e) {
        this.logger.error(`Error ${description} for ${this.deviceName}: ${e}`);
        onError?.();
      }

      await sleep(COMMAND_INTERVAL);
    });
  }
}
