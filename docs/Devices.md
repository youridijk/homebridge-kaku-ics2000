# Fetching devices and device status

## Fetching devices

A list of devices, rooms, groups (multiple devices grouped to one device), scenes, rules, etc., is stored on the cloud
of KAKU, along with the current status of all devices. To fetch this list, you need the MAC-address of your ICS-2000 (
see [Hub](Hub.md)). The list is being fetched as followed:

```http request
POST /gateway.php?action=sync&email=your_kaku_login_email&password_hash=your_kaku_password_plain_text&mac=your-ICS-2000-MAC-address&home_id=
```

The parameters in the url are as followed (you don't need to do anything with this):

```json 
{
    "action": "sync", 
    "email": "your_kaku_login_email",
    "password_hash": "your_kaku_password_plain_text",
    "mac": "your-ICS-2000-MAC-address",
    "home_id": ""
}
```

Fill in your e-mail, password and ICS-2000 MAC in the url above, and you get the list returned. A device in the list
looks as followed:

```json 
{
    "home_id": "Your home id",
    "id": "18769051",
    "version_status": "11881",
    "version_data": "578",
    "status": "Encrypted Base64 string holding the device status",
    "data": "Encrypted Base64 string holding the device data",
    "time_added": null
 }
```

This raw data isn't really useful, because the `status` and `data` values are encrypted with AES-128 and showed in
base-64 format. To get useful data from it, you need to decrypt the data with the AES-key from the cloud.

With `status` and `data` decrypted, the JSON looks as followed:

The extended_module_info array is deleted, because it uses too much space

Note: This JSON looks could different on your account, but most of the JSON will be the same

```json
{
  "home_id": "Your home id",
  "id": "18769051",
  "version_status": "11697",
  "version_data": "578",
  "status": {
    "module": {
      "id": 18769051,
      "functions": [
        1,
        0,
        0,
        0,
        52,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    }
  },
  "data": {
    "module": {
      "id": 18769051,
      "version": 576,
      "name": "Lamp",
      "device": 40,
      "info": [
        19,
        134,
        94,
        192,
        0,
        1,
        1,
        0,
        128,
        0,
        0,
        0,
        15,
        8,
        0,
        0
      ],
      "group_capacity": 16,
      "groups": [
        134219042
      ],
      "endpoints": [
        {
          "device id": 256,
          "profile id": 49246,
          "endpoint": 1,
          "function_mask": 2063
        }
      ],
      "extended_module_info": [
        "integer array"
      ],
      "smd_info": {
        "group": 0,
        "group-type": 0,
        "hidden": false,
        "disabled": false,
        "smd_version": 0
      }
    }
  },
  "time_added": null
}
```

The JSON returned from the cloud contains a lot of information, but the most important things that are used in this
library are:

| Key                | Explanation                                                                                                                                       | Comment                                                   | 
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| `id`               | this is called the entity_id and is a unique ID of a device. It's used to identity a device when you request current status and change the status |                                                           |
| `name`             | This is the name of a device as shown in the KAKU app                                                                                             |                                                           |  
| `device`           | This integer says what type of device it is                                                                                                       | A table with device types can be found beneath this table |
| `functions`        | this array of integers contains the current status of the device, see section about device statuses                                               |                                                           |
| `module` / `group` | This key is used to check whether the device is a group or regular device                                                                         |                                                           |

## Fetching device statuses

As said before, the status of every device is stored in the cloud of KAKU, even if the device doesn't have a status in
the KAKU app. This status is automatically updated if you change the status using the KAKU cloud, directly through the
ICS-2000 or through a physical remote. The statuses are being fetched as followed:

```http request
POST /entity.php?action=get-multiple&email=your_kaku_login_email&password_hash=your_kaku_password_plain_text&mac=your-ICS-2000-MAC-address&home_id=&entity_id=array_of_entity_ids
```

The parameters in the url are as followed (you don't need to do anything with this):

```json 
{
    "action": "get-multiple", 
    "email": "your_kaku_login_email",
    "password_hash": "your_kaku_password_plain_text",
    "mac": "your-ICS-2000-MAC-address",
    "home_id": "",
    "entity_id": ["array_of_entity_ids"]
}
```

The list of entity IDs needs to be an array of integers (each integer is an entity_id) converted to a string.

For example: `"[1244,1244576,23324]"`

In the url it will look like this: `/entity.php?entity_id=[1244,1244576,23324]`

Fill in your e-mail, password, ICS-2000 MAC and the list of entity IDs in the url above, and you get the list returned.
A device in the list looks as followed:

```json 
{
    "id": 18769051,
    "data_version": 578,
    "data": "Encrypted Base64 string holding the device data",
    "status_version": 18343,
    "status": "Encrypted Base64 string holding the device status",
}
```

Again, this raw data isn't really useful, because the `status` and `data` values are encrypted.

With `status` and `data` decrypted, the JSON looks as followed:
The extended_module_info array is deleted, because it uses too much space Note: This JSON looks could different on your
account, but most of the JSON will be the same

```json 
{
    "id": 18769051,
    "data_version": 578,
    "data": {
      "module": {
        "id": 18769051,
        "version": 576,
        "name": "Lamp",
        "device": 40,
        "info": [
          19,
          134,
          94,
          192,
          0,
          1,
          1,
          0,
          128,
          0,
          0,
          0,
          15,
          8,
          0,
          0
        ],
        "group_capacity": 16,
        "groups": [
          134219042
        ],
        "endpoints": [
          {
            "device id": 256,
            "profile id": 49246,
            "endpoint": 1,
            "function_mask": 2063
          }
        ],
        "extended_module_info": ["integer array"],
        "smd_info": {
          "group": 0,
          "group-type": 0,
          "hidden": false,
          "disabled": false,
          "smd_version": 0
        }
      }
    },
```

Again, the cloud returns a lot of data and the only data needed to get the status is the `functions` attribute inside
the `status` attribute. This array of integers tells us information about current state of the device. Each integer
tells something about the device. Here is a table with the index in the array and the meaning of it

(NOTE: Most data is still unknown):

| Index | Range | Description                                                                                           | Tested |
|-------|-------|-------------------------------------------------------------------------------------------------------|--------|
| 0     | 0-1   | The on or off status for devices that can only turn on or off (e.g. wall sockets). 1 is on, 0 is off. | Yes    |
| 3     | 0-1   | The on or off status for Zigbee dim devices (e.g. dimmable light bulbs). 1 is on, 0 is off.           | Yes    |
| 4     | 0-255 | The current brightness of a dimmable Zigbee device.                                                   | Yes    |
| 9     | 0-600 | Zigbee color temperature, according to ICS-2000 Python lib.                                           | No     |

## P1 (telephone port for smart meter)

Using the P1 port on the ICS-2000, you can connect your smart energy meter and view all the data of it in the KAKU app.
Before you can retrieve this data, you need the entity id of the P1 Module. This ID can be retrieved using the same
request as you use for retrieving all devices. In the list of devices can the following JSON be found:

```json
 {
  "home_id": "your home id",
  "id": "your P1 module id as string",
  "version_status": "18081",
  "version_data": "0",
  "status": "encrypted Base64 status",
  "data": {
    "module": {
      "id": "your P1 module id",
      "device": 238,
      "name": "P1 Module"
    }
  },
  "time_added": null
}

```

The name is always `"P1 Module"`, so you can find it using the name.

Now we have the entity id, we can retrieve this data as follows:

```http request
POST /entity.php?action=check&email=your_kaku_login_email&password_hash=your_kaku_password_plain_text&mac=your-ICS-2000-MAC-address&entity_id=id_of_your_p1_meter
```

The parameters in the url are as followed (you don't need to do anything with this):

```json 
{
    "action": "check", 
    "email": "your_kaku_login_email",
    "password_hash": "your_kaku_password_plain_text",
    "mac": "your-ICS-2000-MAC-address",
    "entity_id": "id of your P1 Module as string"
}
```

The result will look like this:

```json
[
  0,
  "Encrypted Base64 string holding the device data",
  0,
  "Encrypted Base64 string holding the device status"
]
```

According to [bp-ouhaha](https://github.com/bp-ouhaha/ICS2000-Python/blob/master/ics2000/Core.py)
the items in the array mean the following:

| Index | Meaning                                                            |
|-------|--------------------------------------------------------------------|
| 0     | Data version                                                       |
| 1     | Data                                                               |
| 2     | Status version                                                     |
| 3     | Status, an array of integers each integer with a different meaning |

With the data decrypted, it looks as followed

```json
[
  0,
  {
    "module": {
      "id": "id of your P1 Module as integer",
      "device": 238,
      "name": "P1 Module"
    }
  },
  0,
  {
    "module": {
      "id": "id of your P1 Module as integer",
      "functions": [
        1836337,
        21467,
        3567,
        32677,
        0,
        1024,
        7227,
        0,
        326886,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        4
      ]
    }
  }
]
```

The data in the `functions` attribute mean the following:

| Index | Description in the KAKU app |
|-------|-----------------------------|
| 0     | Power consumed (low tariff) |
| 1     | Power consumed              |
| 2     | Power produced (low tariff) |
| 3     | Power produced              |
| 4     | Consumption (current)       |
| 5     | Production (current)        |
| 6     | Gas                         |
