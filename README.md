# Klik Aan Klik Uit ICS-2000 Homebridge plugin

This plugin adds HomeKit support for the ICS-2000 from Klik Aan Klik Uit (KAKU). Although this plugin communicates
directly to the ICS-2000 in your local network, it still needs your KAKU credentials, because the current state of every
device is stored on your KAKU account. In addition, the credentials are used to get the encryption key which encrypts
every message send to the ICS-2000 and decrypts the current state data from the cloud.

An example config.json with all required keys:

```json
{
  "platform": "KAKU-ICS2000",
  "name": "ICS-2000",
  "email": "johndoe@email.com",
  "password": "password123"
}
```

In addition, there are a few optional options:

- `deviceBlacklist` - A list of entityIDs of devices you don't want to show up in HomeKit.
- `localBackupAddress` - A backup IP-address that will be used if the IP-address of your ICS-2000 can't be found
  automatically.
- `deviceConfigOverrides` - An object containing override or additional configs. The key is the device type, the value an object according to the [DeviceConfig interface](src/kaku/model/DeviceConfig.ts).

An example config.json with those keys:

```json
{
  "platform": "KAKU-ICS2000",
  "name": "ICS-2000",
  "email": "johndoe@email.com",
  "password": "password123",
  "deviceBlacklist": [
    22204109,
    21053004,
    20108785
  ],
  "localBackupAddress": "192.168.1.5"
}
```

## TODO

| Done?  | Feature                                                                                                                 |
|--------|-------------------------------------------------------------------------------------------------------------------------|
| ✅     | Proper per device hardcoded config like is dimmable, has color temp, dim function, on/off function, color temp function |
| ✅     | User configurable config per device (same config as point above)                                                         |
| ❌     | Debug script in JS. CLI script to control KAKU devices, get status and decrypt messages                                 |
| ❌     | REST server to control KAKU devices, get status and decrypt messages                                                    |
| 

## Contributing

At boot, this plugin will show some information for every device that it adds to HomeKit. If you want to help, you can
put your device types with a short description of the device (e.g. Zigbee dimmer, KAKU smart plug) and optionally a link
to a product page of the product, in a comment
at [issue #12](https://github.com/youridijk/homebridge-kaku-ics2000/issues/12).
If you have devices that don't respond to the commands of this plugin, 
try to identify the functions it uses and open up a PR to add it to [DeviceConfigs.ts](src/kaku/DeviceConfigs.ts)
or open up an issue.

## ICS2000-Python

A big thanks to Stijn-Jacobs for his research on controlling the ICS-2000. This plugin is created using his research, so
checkout [ICS2000-Python](https://github.com/Stijn-Jacobs/ICS2000-Python) on GitHub.
