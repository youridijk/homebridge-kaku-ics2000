import {URLSearchParams} from 'url';
import Cryptographer from './Cryptographer';
import dgram from 'dgram';
import Command from './Command';
import * as fs from 'fs';
import Device from './Device';
import DimDevice from './DimDevice';
import DeviceData from './DeviceData';
import axios from 'axios';

// Set base url for all axios requests
axios.defaults.baseURL = 'https://trustsmartcloud2.com/ics2000_api';

/**
 * A class that represents the ICS-2000 hub
 */
export default class Hub {
  private aesKey?: string;
  private hubMac?: string;
  public devices: Device[] = [];
  private localAddress?: string;
  public readonly deviceStatuses: Map<number, number[]> = new Map<number, number[]>();

  /**
   * Creates a Hub for easy communication with the ics-2000
   * @param email Your e-mail of your KAKU account
   * @param password Your password of your KAKU account
   * @param deviceBlacklist A list of entityID's you don't want to appear in HomeKit
   * @param localBackupAddress Optionally, you can pass the ip address of your ics-2000
   * in case it can't be automatically found in the network
   * @param dimmableOverrides A list of entityIDs of devices that must be treated as a dimmable device, whether it is or isn't.
   */
  constructor(
    private readonly email: string,
    private readonly password: string,
    private readonly deviceBlacklist: number[] = [],
    private readonly localBackupAddress?: string,
    private readonly dimmableOverrides: number[] = [],
  ) {
    this.localAddress = localBackupAddress;
  }

  /**
   * Login on the KAKU server and fetch the AES key and ics-2000 mac address stored on you account
   */
  public async login() {
    const params = new URLSearchParams({
      action: 'login',
      email: this.email,
      password_hash: this.password,
      device_unique_id: 'android',
      platform: '',
      mac: '',
    });

    const request = await axios.post('/account.php', params.toString())
      .catch(error => {
        if (error.response.status === 401) {
          throw new Error('Username/ password combination incorrect');
        }
        throw new Error(error.response.data[0]);
      });

    const responseJson = request.data;

    if (responseJson['homes'].length > 0) {
      const home = responseJson['homes'][0];
      this.aesKey = home['aes_key'];
      this.hubMac = home['mac'];
    } else {
      throw new Error(responseJson);
    }
  }

  /**
   * Method used in map functions to decrypt a list of data from the cloud
   * @param data The data where data and status needs to be decrypted
   * @param decryptData  A boolean which indicates whether you want to decrypt the data or not
   * @param decryptStatus A boolean which indicates whether you want to decrypt the status or not
   * @private
   */
  private formatDeviceData(data: object, decryptData: boolean, decryptStatus: boolean) {
    if (decryptData) {
      const decryptedData = Cryptographer.decryptBase64(data['data'], this.aesKey!);
      data['data'] = JSON.parse(decryptedData);
    }

    // eslint-disable-next-line eqeqeq
    if (decryptStatus && data['status'] != null) {
      const decryptedStatus = Cryptographer.decryptBase64(data['status'], this.aesKey!);
      data['status'] = JSON.parse(decryptedStatus);
    }

    return data;
  }

  /**
   * Fetches the list of devices, rooms, etc., from the KAKU cloud and decrypts the status and data
   * @param decryptData A boolean which indicates whether you want to decrypt the data or not
   * @param decryptStatus A boolean which indicates whether you want to decrypt the status or not
   */
  public async getRawDevicesData(decryptData: boolean, decryptStatus: boolean) {
    if (!this.aesKey || !this.hubMac) {
      throw new Error('Hub mac address or aes key undefined');
    }

    const params = new URLSearchParams({
      action: 'sync',
      email: this.email,
      mac: this.hubMac!,
      password_hash: this.password,
      home_id: '',
    });

    const response = await axios.post('/gateway.php', params.toString());

    const devicesData = await response.data;
    // console.log(devicesData);

    if (decryptData || decryptStatus) {
      // Decrypt the data for every object in the data (scenes, rooms, groups and devices are all in this list)
      devicesData.map(d => this.formatDeviceData(d, decryptData, decryptStatus));
    }

    return devicesData;
  }

  public async getRawDeviceStatuses(decryptData: boolean, decryptStatus: boolean) {
    const deviceIds: number[] = this.devices.map(device => Number(device.entityId));
    const idsString = `[${deviceIds}]`;

    const params = new URLSearchParams({
      'action': 'get-multiple',
      'email': this.email,
      'mac': this.hubMac!,
      'password_hash': this.password,
      'home_id': '',
      'entity_id': idsString,
    });


    const response = await axios.post('/entity.php', params.toString());

    // const devicesJSON = responseJson.filter(device => {
    //   const deviceId = Number(device['id']);
    //   const data = device['data'];
    const statusList: object[] = response.data;

    if (statusList.length === 0) {
      throw new Error(`Unknown error while fetching device statuses, json: ${statusList}`);
    }

    // return statusList.map(device => {
    //   if (decryptData) {
    //     const decryptedData = Cryptographer.decryptBase64(device['data'], this.aesKey!);
    //     device['data'] = JSON.parse(decryptedData);
    //   }
    //
    //   // eslint-disable-next-line eqeqeq
    //   if (decryptStatus && device['status'] != null) {
    //     const decryptedStatus = Cryptographer.decryptBase64(device['status'], this.aesKey!);
    //     device['status'] = JSON.parse(decryptedStatus);
    //   }
    // });

    return statusList.map(d => this.formatDeviceData(d, decryptData, decryptStatus));
  }


  /**
   * Pulls the list of devices connected to your ics-2000 from the serer
   * Stores the list of devices in this class and returns it
   */
  public async pullDevices() {
    // Status will later be decrypted, because fewer data needs to be decrypted
    const devicesData: object[] = await this.getRawDevicesData(true, false);

    const hubCopy = Object.assign({}, this);
    hubCopy.devices = [];

    const devices = devicesData.filter(device => {
      const deviceId = Number(device['id']);
      const data = device['data'];

      if (this.deviceBlacklist.includes(deviceId)) {
        return false;
      }

      // console.log( device['data']['module']['device']);
      device['isGroup'] = 'group' in data;
      // Check if entry is a device or a group
      if ('module' in data && 'info' in data['module'] && data['module']['device'] !== 26) {
        // In my case, there are some devices in this list that are deleted and not shown in the app
        // So we need to filter this out
        // The sum of all values in the info array is always greater than 0 if device exist
        const functionSum = data['module']['info'].reduce((a, b) => a + b, 0);
        return functionSum > 0;
      } else if ('group' in data) {
        // change group key name to module so a group is treated as a device
        device['data']['module'] = device['data']['group'];
        delete device['data']['group'];
        return true;
      }

      return false;
    });

    this.devices = devices.map(device => {
      device['name'] = device['data']['module']['name'];
      device['device'] = device['data']['module']['device'];
      const deviceType = device['device'];

      if (this.dimmableOverrides.includes(device['id'])) {
        return new DimDevice(this, device as DeviceData);
      }

      switch (deviceType) {
        case 48: // 48 is dimmable group
        case 40: // 40 is a dimmable lightbulb
        case 34: // 34 is dimmable -- Thanks to suuus
        case 36: // 36 is a dimmable IKEA/HUE light -- Thanks to suuus
        case 2:  // 2 is dimmable
          return new DimDevice(this, device as DeviceData);
        default:
          return new Device(this, device as DeviceData);
      }
    });

    return this.devices;
  }

  /**
   * Searh in you local network for the ics-2000. The ics-2000 listens to a broadcast message, so that's the way we find it out
   * @param searchTimeout The amount of milliseconds you want to wait for an answer on the sent message, before the promise is rejected
   */
  public async discoverHubLocal(searchTimeout = 10_000) {
    return new Promise<{ address: string; isBackupAddress: boolean }>((resolve, reject) => {
      const message = Buffer.from(
        '010003ffffffffffffca000000010400044795000401040004000400040000000000000000020000003000',
        'hex',
      );
      const client = dgram.createSocket('udp4');

      const timeout = setTimeout(() => {
        client.close();
        if (this.localBackupAddress) {
          resolve({address: this.localBackupAddress!, isBackupAddress: true});
        } else {
          reject('Searching hub timed out and no backup IP-address specified!');
        }
      }, searchTimeout);

      client.on('message', (msg, peer) => {
        client.close();
        clearTimeout(timeout);
        this.localAddress = peer.address;
        resolve({address: peer.address, isBackupAddress: false});
      });

      client.bind(() => client.setBroadcast(true));

      client.send(message, 2012, '255.255.255.255');
    });
  }


  /**
   * Creates a command using the hub mac address and AES-key stored in this hub. Example for turning on a switch: function: 0, value: 1
   * @param deviceId The id of the device you want to run a function on
   * @param deviceFunction The function you want to run on the device
   * @param value The value for the function
   * @param isGroup A boolean which indicates whether the device is a group of other devices or not
   */
  public createCommand(deviceId: number, deviceFunction: number, value: number, isGroup: boolean): Command {
    let deviceFunctions: number[] = [];

    if (isGroup) {
      deviceFunctions = this.deviceStatuses.get(deviceId)!;
    }

    return new Command(this.hubMac!, deviceId, deviceFunction, value, this.aesKey!, isGroup, deviceFunctions);
  }

  /**
   * Creates a command to turn a device on or off and sends it to the ics-2000 ip address stored in this class
   * @param deviceId The id of the device you want to turn on or off
   * @param on Whether you want to turn the device on or off
   * @param onFunction The function used to turn the device on or off
   * @param isGroup A boolean which indicates whether the device is a group of other devices or not
   * @param sendLocal A boolean which indicates whether you want to send the command through KAKU cloud or local using UDP
   */
  public turnDeviceOnOff(deviceId: number, on: boolean, onFunction: number, isGroup: boolean, sendLocal: boolean) {
    if (!this.localAddress) {
      throw new Error('Local address is undefined');
    }

    const command = this.createCommand(deviceId, onFunction, on ? 1 : 0, isGroup);
    if (sendLocal) {
      return this.sendCommandToHub(command);
    } else {
      return this.sendCommandToCloud(command);
    }
  }

  public async sendCommandToHub(command: Command): Promise<void> {
    return command.sendTo(this.localAddress!, 2012);
  }

  public async sendCommandToCloud(command: Command): Promise<void> {
    return command.sendToCloud(this.email, this.password);
  }

  /**
   * Creates a command to dim a device and sends it to the ics-2000 ip address stored in this class
   * @param deviceId The id of the device tou want tot dim
   * @param dimFunction The function you want to use to dim the device
   * @param dimLevel The new dim value (0 = off, 255 = 100% brightness)
   * @param isGroup A boolean which indicates whether the device is a group of other devices or not
   * @param sendLocal A boolean which indicates whether you want to send the command through KAKU cloud or local using UDP
   */
  public dimDevice(deviceId: number, dimFunction, dimLevel, isGroup: boolean, sendLocal: boolean) {
    if (!this.localAddress) {
      throw new Error('Local address is undefined');
    }

    if (dimLevel < 0 || dimLevel > 255) {
      throw new Error(`Dim level ${dimLevel} is negative or greater than 255`);
    }

    const command = this.createCommand(deviceId, dimFunction, dimLevel, isGroup);

    if (sendLocal) {
      return command.sendTo(this.localAddress!, 2012);
    } else {
      return this.sendCommandToCloud(command);
    }

  }

  public async getAllDeviceStatuses() {
    const statusList = await this.getRawDeviceStatuses(false, true);

    for (const device of statusList) {
      // console.log(device)
      // const status = Cryptographer.decryptBase64(device['status'], this.aesKey!);
      // const jsonStatus = JSON.parse(status);
      const jsonStatus = device['status'];

      // Functions array is stored with different keys for groups and devices (modules)
      if ('module' in jsonStatus) {
        this.deviceStatuses.set(device['id'], jsonStatus['module']['functions']);
      } else if ('group' in jsonStatus) {
        this.deviceStatuses.set(device['id'], jsonStatus['group']['functions']);
      } else {
        throw new Error('Module or group data not found');
      }
    }
  }

  private updateDate: Date = new Date();
  private updating = false;

  public async sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /**
   * Get the current status of a device
   * @param deviceId The id of the device you want to get the status of
   * @returns A list of numbers that represents the current status of the device.
   * index 0 is on/off status for switch, index 3 on/off for zigbee lightbulb, index 4 is current dim level
   */
  public async getDeviceStatus(deviceId: number): Promise<number[]> {
    const currentDate = new Date();
    const updateDate = this.updateDate;
    this.updateDate = new Date();

    const dateDifference = currentDate.getTime() - updateDate.getTime();

    if (dateDifference >= 2000) {
      this.updating = true;
      await this.getAllDeviceStatuses();
      this.updating = false;
    }

    // Wait till the new data is fetched
    while (this.updating) {
      await this.sleep(100);
    }

    return this.deviceStatuses.get(deviceId)!;
    // return this.getDeviceStatusFromServer(deviceId);
  }

  /**
   * Get the current status of a device, directly from the server
   * @param deviceId The id of the device you want to get the status of
   * @returns A list of numbers that represents the current status of the device.
   * index 0 is on/off status, index 4 is current dim level
   */
  public async getDeviceStatusFromServer(deviceId: number): Promise<number[]> {
    if (!this.aesKey || !this.hubMac) {
      throw new Error('Hub mac address or aes key undefined');
    }

    const params = new URLSearchParams({
      'action': 'get-multiple',
      'email': this.email,
      'mac': this.hubMac!,
      'password_hash': this.password,
      'home_id': '',
      'entity_id': `[${deviceId}]`,
    });

    const response = await axios.post('/entity.php', params.toString())
      .catch(error => {
        if (error.response.status === 404) {
          throw new Error(`Device with id ${deviceId} not found`);
        } else {
          throw new Error(error.response.data);
        }
      });

    const responseJson: object[] = response.data;

    if (responseJson.length === 0) {
      throw new Error(`Device with id ${deviceId} not found`);
    }

    if (!responseJson[0]['status']) {
      return [0];
    }

    // Get first item of the list and grep the status of it
    const status = Cryptographer.decryptBase64(responseJson[0]['status'], this.aesKey);
    const jsonStatus = JSON.parse(status);


    // Functions array is stored with different keys for groups and devices (modules)
    if ('module' in jsonStatus) {
      return jsonStatus['module']['functions'];
    } else if ('group' in jsonStatus) {
      return jsonStatus['group']['functions'];
    } else {
      throw new Error('Module or group data not found');
    }
  }

  /**
   * A method to write the list of devices, rooms, etc. to a JSON file called 'devices.json'
   * @param decryptData A boolean which indicates whether you want to decrypt the data or not
   * @param decryptStatus A boolean which indicates whether you want to decrypt the status or not
   */
  public async generateDevicesJSON(decryptData: boolean, decryptStatus: boolean) {
    if (!this.aesKey || !this.hubMac) {
      // console.log('MAC or AES key is null, so logging in!');
      await this.login();
    }

    const devices = await this.getRawDevicesData(decryptData, decryptStatus);
    fs.writeFileSync('devices.json', JSON.stringify(devices, null, 2));
  }

  /**
   * A method to write the list of statuses of all devices to a JSON file called 'statuses.json'
   * @param decryptData A boolean which indicates whether you want to decrypt the data or not
   * @param decryptStatus A boolean which indicates whether you want to decrypt the status or not
   */
  public async generateDeviceStatusesJSON(decryptData: boolean, decryptStatus: boolean) {
    if (!this.aesKey || !this.hubMac) {
      // console.log('MAC or AES key is null, so logging in!');
      await this.login();
      await this.pullDevices();
    }

    const devices = await this.getRawDeviceStatuses(decryptData, decryptStatus);
    fs.writeFileSync('statuses.json', JSON.stringify(devices, null, 2));
  }
}

module.exports = Hub;
