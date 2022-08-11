## Encryption key

Before you can do anything with the ICS-2000, you need the AES encryption key stored on your account. Every message send
to the ICS-2000 is encrypted with this key and an [IV](https://en.wikipedia.org/wiki/Initialization_vector)
send with every message (first 16 bytes of an encrypted message from the KAKU server or the ICS-2000 is the IV). Without
this key, you can't send messages to the ICS-2000 and you can't decrypt data stored on the KAKU server.


## ICS-2000 MAC-address
The MAC-address of your ICS-2000 is stored on your account and is needed to send a message to the ICS-2000.
In every message that's sent, the MAC-address is put into the message.

## Fetching the key and the MAC-address of your ICS-2000

The AES-key (along with some other account details that are not relevant) are fetched as followed:

```http request
POST /account.php?action=login&email=your_kaku_login_email&password_hash=your_kaku_password_plain_text&device_unique_id=android&platform=&mac=
```

The parameters in the url are as followed (you don't need to do anything with this):

```json 
{
    "action": "login", 
    "email": "your_kaku_login_email",
    "password_hash": "your_kaku_password_plain_text",
    "device_unique_id": "android",
    "platform": "",
    "mac": ""
}
```

Fill in your e-mail and password in the url above, and you get the following JSON returned:

```json 
{
    "person_name": "Your name",
    "newsletter": true / false,
    "ipcam_only": true / false,
    "homes": [
        {
            "home_id": "your home id (integer) as string",
            "home_name": "Your home name",
            "mac": "Your ICS-2000 MAC-address",
            "aes_key": "Your AES-key"
        }
    ],
    "cameras": ["Array of your cameras"]
}
```

## Discovering the Hub (ICS-2000)
Discovering the ICS-2000 is done using a UDP broadcast message. 
You need to send the following message to IP-address `255.255.255.255` and port `2012` using a UDP-socket with broadcast
option enabled:

NOTE: I don't know what this message means, but I found the message using [Wireshark](https://www.wireshark.org)

```hex
010003ffffffffffffca000000010400044795000401040004000400040000000000000000020000003000
```

The ICS-2000 reacts to this message with a new message. I don't know what this message means, but it's not important
for the discovery of the ICS-2000, because we only need the IP-address of the ICS-2000. Because the ICS-2000 sends
a message back, we know the IP-address of the sender of the message: the ICS-2000.
