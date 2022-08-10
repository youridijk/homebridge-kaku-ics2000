# Fetching devices and device status

## Fetching devices

A list of devices, rooms, groups (multiple devices grouped to one device), scenes, rules, etc., is stored on the cloud
of KAKU, along with the current status of all devices. To fetch this list, you need the MAC-address of your ICS-2000 (
see [MacAndAES](MacAndAES.md)). The list is being fetched as followed:

```http request
POST https://trustsmartcloud2.com/ics2000_api/gateway.php?action=sync&email=your_kaku_login_email&password_hash=your_kaku_password_plain_text&mac=your-ICS-2000-MAC-address&home_id=
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
    "status": "k08fQVFhTePWbErcS2xT/LAu4QjK1WJ8y5P1Z1N2I8HLjt+m9VSVvymxBTQ/EoduJd75NP4I/M5yc7PUmbuG2N08y3hRbNdRi2nxd0wmH3F3NYSbK8UQ4dbnlgLV9nA+",
    "data": "pQzf9jJ6OCw+TGgtz6QeusfDPjsZUZ5ZRwpofTIa0K+JseC1gsumxJ4qHFQuYfQBiVoD/1Lg2C3uBH5Ji+CEcDjaUp4Le5YpoAvsyK39by7k2InxvOWKidolj7K6L08h+4S4HdhuyrGI4vJeI5vrgAEjP77U1aCC4xmpZ0q+Et3gzrjp7M0gAOPCXCiGILVb/bDN1zORt5kevhVEnxw0x6cRn2mdJTSX2dudWRi0RywOZaYwuVsQvubLZA5034+ybyCV8d0az3yqInb5jVRN1RXTafg6RCV8+S+b/PIoNgYEaXRj64/XQ39NHDc9/2FITCKPSindSP+lZ34V4D9+Vu5nlnsGcW+yRYQ7+o+quZExMTPS/LcjY13tciYz+QqG7S3Sx3EUsW//RUaYyTalJPuwRJQZQ6PqGIHCRwjMtSXKfVvLvucHmwoBv0PoC/s4gIFMzO/ligJYbzG6LhbS8P65hvpPfdg/t+N97YssSu4SLbjzGgeY2d7muK4/qdn3XZtMNV4r80A+vMLB7ejU8PIivxi8RcLoSbhni3KVlLRM1JCQVkz9uYo2OphgI731jX9Tn13LImjkWamyIc8qJZFneiuxoxzvRTqViXvItvqfxGnVqerLR9595oEBQNgGNiW+yIcvorKyrGE/YfheRRXn1FCiaainFoifdhobBGs3iNlNA3bRWAdV6j16Gn2W",
    "time_added": null
 }
```

This raw data isn't really useful, because the `status` and `data` values are encrypted with AES-128 and showed in
base-64 format. To get useful data from it, you need to decrypt the data with the AES-key from the cloud.

With `status` and `data` decrypted, the JSON looks as followed
(the number arrays are deleted, because they take too much space):
Note: this 

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

## P1 (telephone port for smart meter)
