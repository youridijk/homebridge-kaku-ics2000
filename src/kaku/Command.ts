import {Buffer} from 'buffer';
import Cryptographer from './Cryptographer';
import dgram from 'dgram';
import {URLSearchParams} from 'url';
import axios from 'axios';

/**
 * This class represents a command sent to the ICS-2000
 */
export default class Command {
  public readonly totalMessage: Buffer;
  private readonly client = dgram.createSocket('udp4');

  /**
   * Create a command for the ics-2000
   * @param hubMac The mac-address of your ics-2000 without colons
   * @param deviceId The id of the device your command is about
   * @param deviceFunction The function you want to call for the specified device
   * @param value The value for the specified function
   * @param aesKey The AES-key what you want to encrypt the message with, this key is stored on your KAKU account
   * @param isGroup A boolean which indicates whether the device is a group of other devices or not
   * @param deviceFunctions The list of the functions / status list (list of integers which represent the current state),
   * only needed if device is a group
   */
  constructor(
    public readonly hubMac: string,
    public readonly deviceId: number,
    public readonly deviceFunction: number,
    public readonly value: number,
    public readonly aesKey: string,
    public readonly isGroup: boolean,
    public readonly deviceFunctions: number[] = [],
  ) {
    const dataObject = {};

    dataObject[isGroup ? 'group' : 'module'] = {
      id: deviceId,
      function: deviceFunction,
      value: value,
    };

    // This extra data is not required, but it is if you want the status of the devices to be updated correctly
    // + with this extra data, all the members of the group are updated as well
    // It's possible to just send a command like you would for a regular device, but the status will be wrong
    // (you turned a device on but homekit says it's off)
    if (isGroup) {
      dataObject['group']['update_group_members'] = true;
      deviceFunctions[deviceFunction] = value;
      dataObject['group']['functions'] = deviceFunctions;
    }

    const encryptedData = Cryptographer.encrypt(JSON.stringify(dataObject), aesKey);
    const data = Buffer.from(encryptedData, 'hex');
    const header = Buffer.alloc(43);
    header.writeUInt8(1); // set frame
    header.writeUInt32LE(653213, 9); // set magic
    header.writeUInt8(128, 2); // set type
    header.writeUInt16LE(data.length, 41); // set data length
    header.writeUInt32LE(deviceId, 29); // set entityId

    // set mac
    const macBuffer = Buffer.from(hubMac, 'hex');
    for (let i = 0; i < macBuffer.length; i++) {
      header[3 + i] = macBuffer[i];
    }

    this.totalMessage = Buffer.concat([header, data]);
  }

  /**
   * Sends this command to a device with specified host and port
   * @param host The host you want to send the command to, this is the ip-address of your ics-2000
   * @param port The port you want to send the command to, this 2012 for the ics-2000
   * @param sendTimeout The number of millisecond you want to wait before the message times out and the promise rejected
   */
  public sendTo(host: string, port: number, sendTimeout = 10_000) {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject('Message timed out');
      }, sendTimeout);

      // ICS-2000 sends message back on succes
      this.client.on('message', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.client.bind();

      this.client.send(this.totalMessage, port, host, ((error) => {
        if (error) {
          reject(error);
        }
      }));
    });
  }

  public async sendToCloud(email: string, password: string): Promise<void> {
    const params = new URLSearchParams({
      'action': 'add',
      'email': email,
      'mac': this.hubMac!,
      'password_hash': password,
      'device_unique_id': '',
      'command': this.toHex(),
    });

    const response = await axios.get('/command.php', {
      params: params,
    });

    if (response.status !== 200) {
      throw new Error(`Non 200 status returned: ${response.status}`);
    }
  }

  public toHex(): string {
    return this.totalMessage.toString('hex');
  }
}

module.exports = Command;
