# Communication

## Communication methods

There are two different ways to communicate with your devices:
using UDP directly to the ICS-2000 or using the KAKU cloud. The messages are the same for the two different methods.
More about the messages later.

### Direct messages to the ICS-2000

Direct messages to the ICS-2000 is done using UDP. After a command is created, you can send it to the ICS-2000 using its
IP-address and the port `2012`. If the message is valid, the ICS-2000 sends a message back. Because you don't know if a
message is received if you are using UDP, the only way of knowing that a message is received and the status of your
device is changed, is waiting for a reaction from the ICS-2000.

### Messages through the KAKU cloud

The second option to communicate with your devices, is through the KAKU cloud. This allows you to communicate with your
devices outside your LAN. Sending a command using the KAKU cloud goes as followed:

```http request
GET /command.php?action=add&email=your_kaku_login_email&password_hash=your_kaku_password_plain_text&mac=your-ICS-2000-MAC-address&device_unique_id=&command=your_generate_command
```

The parameters in the url are as followed (you don't need to do anything with this):

```json 
{
    "action": "add", 
    "email": "your_kaku_login_email",
    "password_hash": "your_kaku_password_plain_text",
    "mac": "your-ICS-2000-MAC-address",
    "device_unique_id": "",
    "command": "your generate command to change the device status"
}
```

This request returns an array of one integer as a string. The meaning of the integer is unknown for me.

## The command structure

Every command contains a header which contains the MAC-address of your ICS-2000 and the entity id of the device you want
to change the status of. In addition, every command has encrypted JSON data containing the entity id and the new status.

### The header

The header exists out of 43 bytes which are in the beginning all zero's (so 86 zeros). During the making of a command,
there is data inserted on a few places. These places are **bold** marked in the following header:

**01** 00 **80** **0024a3116c52** **9df70900** 00000000000000000000000000000000 **4543310** 000000000000000005000

frame type mac magic entity_id

| HEX part     | Meaning         | Value                                                                | 
|--------------|-----------------|----------------------------------------------------------------------|
| 01           | Frame           | Always 1                                                             |
| 80           | Type            | Always 128                                                           |
| 0024a3116c52 | Hub MAC-address | The MAC address of your ICS-2000                                     |
| 9df70900     | Magic           | Always 653213                                                        |
| 4543310      | Entity ID       | The ID of the device you want to change the status of in Hexadecimal |

### The data

The data in the command is a JSON-object encrypted with the AES-key from your KAKU account. The object looks as
followed for a regular device:

```json
{
  "module": {
    "id": "The ID of the device you want to change the status of",
    "function": "An integer representing the type of change you want to do, e.g. 0 for turning on a device.",
    "value": "The new value for the function, e.g. 1 if you want to turn the device on"
  }
}
```

This JSON-data works for groups as well, but the status isn't updated. 
So your lights stay off in homebridge, even though you turned them on.

For a group the JSON looks as followed:

```json
{
  "group": {
    "id": "The ID of the device you want to change the status of",
    "function": "An integer representing the type of change you want to do, e.g. 0 for turning on a device.",
    "value": "The new value for the function, e.g. 1 if you want to turn the device on",
    "update_group_members": true,
    "functions": ["integers list which is the same as the 'functions' list in the current status"]
  }
}
```

The `function` attribute is the same value used to get the current device status.
See [Fetching device statuses in Devices.md](Devices.md) for the table for tje functions.

### Total message
The total message is the result of the header with the data filled in and the encrypted data in hex format combined.
The result is one long hexadecimal string.




