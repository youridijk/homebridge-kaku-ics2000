import {Buffer} from 'buffer';
import {Cryptographer} from './Cryptographer';
import dgram from 'dgram';

export class Command {
  public readonly totalMessage: Buffer;
  private readonly client = dgram.createSocket('udp4');

  /**
   * Create a command for the ics-2000
   * @param hubMac The mac-address of your ics-2000 without colons
   * @param deviceId The id of the device your command is about
   * @param deviceFunction The function you want to call for the specified device
   * @param value The value for the specified function
   * @param aesKey The AES-key what you want to encrypt the message with, this key is stored on your KAKU account
   */
  constructor(
    private readonly hubMac: string,
    private readonly deviceId: number,
    private readonly deviceFunction: number,
    private readonly value: number,
    private readonly aesKey: string,
  ) {
    const dataObject = {
      module: {
        id: deviceId,
        function: deviceFunction,
        value: value,
      },
    };

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
}