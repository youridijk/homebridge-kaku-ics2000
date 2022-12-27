import {API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic} from 'homebridge';
import {Hub, SwitchDevice, DimDevice, ColorTemperatureDevice} from 'ics-2000';
import LightBulb from './devices/LightBulb';
import {PLATFORM_NAME, PLUGIN_NAME, RELOAD_SWITCH_NAME} from './settings';
import DimmableLightBulb from './devices/DimmableLightBulb';
import ReloadSwitch from './ReloadSwitch';
import schedule from 'node-schedule';
import ColorTemperatureLightBulb from './devices/ColorTemperatureLightBulb';

export default class KAKUPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private readonly cachedAccessories: PlatformAccessory[] = [];
  public readonly hub: Hub;
  private registeredDeviceIds: number[] = [];
  public readonly discoverMessage?: string;

  constructor(
    public readonly logger: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.logger.debug('Finished initializing platform:', this.config.name);
    const {email, password} = config;

    const deviceBlacklist: number[] = config.deviceBlacklist ?? [];

    if (deviceBlacklist.length > 0) {
      this.logger.info(`Blacklist contains ${deviceBlacklist.length} devices: ${deviceBlacklist}`);
    }

    const {localBackupAddress} = config;

    if (localBackupAddress) {
      this.logger.info(`Using ${localBackupAddress!} as backup ip`);
    }

    const deviceConfigsOverrides = config.deviceConfigsOverrides ?? {};
    const keyCount = Object.keys(deviceConfigsOverrides).length;

    if (keyCount > 0) {
      this.logger.info(`Device config overrides contains ${keyCount} device types`);
    }

    this.discoverMessage = config.discoverMessage;

    if(this.discoverMessage){
      this.logger.info(`Using custom discover message: ${this.discoverMessage!}`);
    }

    // Create a new Hub that's used in all accessories
    this.hub = new Hub(email, password, deviceBlacklist, localBackupAddress, deviceConfigsOverrides);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', async () => {
      await this.setup();
      this.createReloadSwitch();
      // Rerun the setup every day so that the devices listed in HomeKit are up-to-date, the AES key for the command is up-to-date and
      // The local ip-address of your ics-2000 is up-to-date
      schedule.scheduleJob('0 0 * * *', async () => {
        this.logger.info('Pulling AES-key from server and searching for ics2000 as scheduled');
        // this.setup();
        const {isBackupAddress} = await this.hub.discoverHubLocal(10_000, this.discoverMessage);
        if (isBackupAddress) {
          this.searchTimeOutWarning();
        }
        await this.hub.login();
      });
    });
  }

  public async setup() {
    this.logger.info('Setup called!');
    await this.hub.login()
      .catch(error => this.logger.error(`Error logging in: ${error}`));
    await this.discoverDevices()
      .catch((error) => this.logger.error(`Error discovering devices: ${error}`));
    await this.hub.getAllDeviceStatuses()
      .catch((error) => this.logger.error(`Error fetching device statuses: ${error}`));
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.logger.debug('Loading accessory from cache:', accessory.displayName);
    this.cachedAccessories.push(accessory);
  }

  /**
   * Create a new instance of a Lightbulb
   * Currently, device types is limited to on/off switches (LightBulbs in this library)
   * and dimmable lights (DimmableLightBulb in this library)
   * I don't have other types of devices
   * @param accessory The accessory object you want to create a new Device with
   * @private
   */
  private createDevice(accessory: PlatformAccessory) {
    const {device} = accessory.context;

    if (device instanceof ColorTemperatureDevice) {
      new ColorTemperatureLightBulb(this, accessory);
    } else if (device instanceof DimDevice) {
      new DimmableLightBulb(this, accessory);
    } else if (device instanceof SwitchDevice) {
      new LightBulb(this, accessory);
    } else {
      throw new Error(`Device hasn't any controls: ${device.entityId} ${device.name} ${device.deviceType}`);
    }
  }

  private async discoverDevices() {
    // Search hub and pull devices from the server
    this.logger.info('Searching hub');
    const {address: hubIp, isBackupAddress} = await this.hub.discoverHubLocal(10_000, this.discoverMessage);

    if (isBackupAddress) {
      this.searchTimeOutWarning();
    }

    this.logger.info(`Found hub: ${hubIp}`);
    this.logger.info('Pulling devices from server');
    const foundDevices = await this.hub.pullDevices();
    const filteredDevices = foundDevices.filter(d => !d.disabled);

    this.logger.info(`Found ${foundDevices.length} devices`);

    for (const device of filteredDevices) {
      const entityId = device.entityId;
      const deviceType = device.deviceType;

      if (this.registeredDeviceIds.includes(entityId)) {
        continue;
      } else {
        this.registeredDeviceIds.push(entityId);
      }

      const uuid = this.api.hap.uuid.generate(entityId.toString());
      const existingAccessory = this.cachedAccessories.find(accessory => accessory.UUID === uuid);

      // Create the accessory
      try {
        if (existingAccessory) {
          existingAccessory.context.device = device;
          this.createDevice(existingAccessory);
          this.logger.info(`Loaded device from cache: 
        name=${device.name}, entityId=${device.entityId}, deviceType=${deviceType}`);
        } else {
          const deviceName = device.name;
          const accessory = new this.api.platformAccessory(deviceName, uuid);

          // store a copy of the device object in the `accessory.context`
          accessory.context.device = device;
          accessory.context.name = deviceName;

          this.createDevice(accessory);
          this.logger.info(`Loaded new device: name=${device.name}, entityId=${device.entityId}, deviceType=${deviceType}`);
          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }
      }catch (e){
        this.logger.error(`${e}`);
      }
    }
  }

  /**
   * Create a reload switch, so you can rerun the setup without touching homebridge
   * @private
   */
  private createReloadSwitch() {
    const uuid = this.api.hap.uuid.generate(RELOAD_SWITCH_NAME);
    const existingAccessory = this.cachedAccessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      new ReloadSwitch(this, existingAccessory);
    } else {
      const reloadSwitchAccessory = new this.api.platformAccessory(RELOAD_SWITCH_NAME, uuid);
      new ReloadSwitch(this, reloadSwitchAccessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [reloadSwitchAccessory]);
    }

    this.logger.info('Created reload switch');
  }

  private searchTimeOutWarning(): void {
    this.logger.warn('Searching hub timed out! Using backup address for communication');
  }
}
