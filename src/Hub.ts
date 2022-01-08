import fetch from 'node-fetch';
import {URLSearchParams} from 'url';
import {Cryptographer} from './Cryptographer';
import dgram from 'dgram';
import {Command} from './Command';

export class Hub {
  private readonly baseUrl = 'https://trustsmartcloud2.com/ics2000_api';
  private aesKey?: string;
  private hubMac?: string;
  public devices: object[] = [];
  private localAddress?: string;

  /**
   * Creates a Hub for easy communication with the ics-2000
   * @param email Your e-mail of your KAKU account
   * @param password Your password of your KAKU account
   * @param deviceBlacklist A list of device ID's you don't want to appear in HomeKit
   * @param localBackupAddress Optionally, you can pass the ip address of your ics-2000
   * in case it can't be automatically found in the network
   */
  constructor(
    private readonly email: string,
    private readonly password: string,
    private readonly deviceBlacklist: number[] = [],
    private readonly localBackupAddress?: string,
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

    const request = await fetch(`${this.baseUrl}/account.php`, {
      method: 'POST',
      body: params,
    });

    if (request.status === 401) {
      throw new Error('Username/ password combination incorrect');
    }

    const responseJson = await request.json();


    if (request.ok && responseJson['homes'].length > 0) {
      const home = responseJson['homes'][0];
      this.aesKey = home['aes_key'];
      this.hubMac = home['mac'];
    } else {
      throw new Error(responseJson[0]);
    }
  }

  /**
   * Pulls the list of devices connected to your ics-2000 from the serer
   * Stores the list of devices in this class and returns it
   */
  public async pullDevices() {
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

    const response = await fetch(`${this.baseUrl}/gateway.php`, {
      method: 'POST',
      body: params,
    });

    const responseJson: object[] = await response.json();

    if (response.ok) {
      // Decrypt the data for every object in the data (scenes, rooms, groups and devices are all in this list)
      responseJson.map(device => {
        const decryptedData = Cryptographer.decryptBase64(device['data'], this.aesKey!);
        device['data'] = JSON.parse(decryptedData);
      });

      this.devices = responseJson.filter(device => {
        const deviceId = Number(device['id']);
        const data = device['data'];

        if (this.deviceBlacklist.includes(deviceId)) {
          return false;
        }

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

      this.devices.map(device => {
        const decryptedStatus = Cryptographer.decryptBase64(device['status'], this.aesKey!);
        device['status'] = JSON.parse(decryptedStatus);
        device['name'] = device['data']['module']['name'];
        device['device'] = device['data']['module']['device'];
      });

      return this.devices;
    } else {
      throw new Error(responseJson[0].toString());
    }
  }

  /**
   * Searh in you local network for the ics-2000. The ics-2000 listens to a broadcast message, so that's the way we find it out
   * @param searchTimeout The amount of milliseconds you want to wait for an answer on the sent message, before the promise is rejected
   */
  public async discoverHubLocal(searchTimeout = 10_000) {
    return new Promise<string>((resolve, reject) => {
      const message = Buffer.from(
        '010003ffffffffffffca000000010400044795000401040004000400040000000000000000020000003000',
        'hex',
      );
      const client = dgram.createSocket('udp4');

      const timeout = setTimeout(() => {
        client.close();
        reject('Searching hub timed out! Using backup address for communication');
      }, searchTimeout);

      client.on('message', (msg, peer) => {
        client.close();
        clearTimeout(timeout);
        this.localAddress = peer.address;
        resolve(peer.address);
      });

      client.bind(() => {
        client.setBroadcast(true);
      });

      client.send(message, 2012, '255.255.255.255');
    });
  }


  /**
   * Creates a command using the hub mac address and AES-key stored in this hub. Example for turning on a switch: function: 0, value: 1
   * @param deviceId The id of the device you want to run a function on
   * @param deviceFunction The function you want to run on the device
   * @param value The value for the function
   */
  public createCommand(deviceId: number, deviceFunction: number, value: number): Command {
    return new Command(this.hubMac!, deviceId, deviceFunction, value, this.aesKey!);
  }

  /**
   * Creates a command to turn a device on or off and sends it to the ics-2000 ip address stored in this class
   * @param deviceId The id of the device you want to turn on or off
   * @param on Whether you want to turn the device on or off
   * @param onFunction The function used to turn the device on or off
   */
  public turnDeviceOnOff(deviceId: number, on: boolean, onFunction = 0) {
    if (!this.localAddress) {
      throw new Error('Local address is undefined');
    }

    const command = this.createCommand(deviceId, onFunction, on ? 1 : 0);
    return command.sendTo(this.localAddress!, 2012);
  }

  /**
   * Creates a command to dim a device and sends it to the ics-2000 ip address stored in this class
   * @param deviceId The id of the device tou want tot dim
   * @param dimFunction The function you want to use to dim the device
   * @param dimLevel The new dim value (0 = off, 255 = 100% brightness)
   */
  public dimDevice(deviceId: number, dimFunction = 4, dimLevel) {
    if (!this.localAddress) {
      throw new Error('Local address is undefined');
    }

    if (dimLevel < 0 || dimLevel > 255) {
      throw new Error(`Dim level ${dimLevel} is negative or greater than 255`);
    }

    const command = this.createCommand(deviceId, dimFunction, dimLevel);
    return command.sendTo(this.localAddress!, 2012);
  }

  /**
   * Get the current status of a device
   * @param deviceId The id of the device you want to get the status of
   * @returns A list of numbers that represents the current status of the device.
   * index 0 is on/off status, index 4 is current dim level
   */
  public async getDeviceStatus(deviceId: number): Promise<number[]> {
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

    const response = await fetch(`${this.baseUrl}/entity.php`, {
      method: 'POST',
      body: params,
    });

    const responseJson: object[] = await response.json();

    if (responseJson.length === 0 || response.status === 404) {
      throw new Error(`Device with id ${deviceId} not found`);
    }

    if (response.ok) {
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
    } else {
      throw new Error(responseJson[0].toString());
    }
  }
}