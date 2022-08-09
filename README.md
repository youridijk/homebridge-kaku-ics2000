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

In addition, you can pass a `deviceBlacklist` key to specify a list of IDs of devices you don't want to show up in HomeKit.
Further, you can specify a `localBackupAddress` key to specify the IP-address of your ICS-2000. This IP-address will 
only be used if this plugin can't find the IP-address of your ICS-2000 automatically.

An example config.json with these 2 keys:

```json
{
  "platform": "KAKU-ICS2000",
  "name": "ICS-2000",
  "email": "johndoe@email.com",
  "password": "password123",
  "deviceBlacklist": [22204109, 21053004, 20108785],
  "localBackupAddress": "192.168.1.5"
}
```

## ICS2000-Python
A big thanks to Stijn-Jacobs for his research on controlling the ICS-2000. This plugin is created using his research, 
so checkout [ICS2000-Python](https://github.com/Stijn-Jacobs/ICS2000-Python) on GitHub.
