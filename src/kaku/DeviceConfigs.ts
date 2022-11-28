import DeviceConfig from './model/DeviceConfig';

// Defaults
// Switch: onOffFunction: 0
// Switch zigbee: onOffFunction: 3
// Dimmable: dimFunction 1
// Dimmable zigbee: dimFunction 4
// Color temp: onOffFunction: 3, dimFunction 4, colorTemperatureFunction 9

const deviceConfigs: Record<number, DeviceConfig> = {
  1: {
    modelName: 'APC3-2300R KAKU 443MHz Smartplug',
    onOffFunction: 0,
  },
  2: { // DeviceType 2 uses 0 to 15 for dim values
    modelName: 'KAKU dimmable',
    onOffFunction: 0,
    dimFunction: 1,
    maxBrightness: 15,
  },
  3: {
    disabled: true,
    modelName: 'Actuator',
  },
  4: {
    disabled: true,
    modelName: 'Trust wireless motion detector for outdoor use',
  },
  5: {
    disabled: true,
    modelName: 'Contact sensor',
  },
  6: {
    disabled: true,
    modelName: 'ACDB 7000A doorbell',
  },
  7: {
    disabled: true,
    modelName: '1 Channel wall control',
  },
  8: {
    disabled: true,
    modelName: '2 Channel wall control',
  },
  9: {
    disabled: true,
    modelName: '1 Channel remote control',
  },
  10: {
    disabled: true,
    modelName: '2 Channel remote control',
  },
  11: {
    disabled: true,
    modelName: '3 Channel remote control',
  },
  12: {
    disabled: true,
    modelName: '16 Channel remote control AYCT-102',
  },
  13: {
    disabled: true,
    modelName: 'Wall mounted remote control AYCT_202',
  },
  14: {
    disabled: true,
    modelName: 'Ambient light sensor',
  },
  15: {
    disabled: true,
    modelName: 'Dusk sensor',
  },
  16: {
    disabled: true,
    modelName: 'ARC Remote',
  },
  17: {
    disabled: true,
    modelName: 'ARC Contact sensor',
  },
  18: {
    disabled: true,
    modelName: 'ARC Motion sensor',
  },
  19: {
    disabled: true,
    modelName: 'ARC Smoke sensor',
  },
  20: {
    disabled: true,
    modelName: 'ARC Siren',
  },
  21: {
    disabled: true,
    modelName: 'ACDB 7000B Doorbell',
  },
  22: {
    disabled: true,
    modelName: 'AWMT Buil-in wall switch',
  },
  23: {
    disabled: true,
    modelName: 'Somfy Actuator',
  },
  24: {
    modelName: 'KAKU dimmable lightbulb',
    onOffFunction: 0,
    dimFunction: 1,
    maxBrightness: 15,
  },
  25: {
    disabled: true,
    modelName: 'AGST 8800 KAKU 1 button wireless wall switch',
  },
  26: {
    disabled: true,
    modelName: 'AGST 8802 KAKU 2 button wireless wall switch',
  },
  27: {
    disabled: true,
    modelName: 'BREL Actuator',
  },
  28: {
    disabled: true,
    modelName: 'Contact sensor 2',
  },
  29: {
    disabled: true,
    modelName: 'ARC Keychain remote',
  },
  30: {
    disabled: true,
    modelName: 'ARC Action button',
  },
  31: {
    disabled: true,
    modelName: 'ARC Rotary dimmer',
  },
  32: {
    disabled: true,
    modelName: 'Unkown Zigbee device',
  },
  33: { // 0 for onOff not working, maybe this,
    modelName: 'Zigbee (ledvance) smart plug',
    onOffFunction: 3,
  },
  34: { // not tested
    modelName: 'Dimmable',
    onOffFunction: 3,
    dimFunction: 4,
  },
  35: {
    modelName: 'Zigbee RGB Light',
  },
  36: {
    modelName: 'Zigbee (ledvance) dimmable with color temperature',
    onOffFunction: 3,
    dimFunction: 4,
    colorTemperatureFunction: 9,
  },
  37: {
    disabled: true,
    modelName: 'Zigbee multi purpose dimmer',
  },
  38: {
    disabled: true,
    modelName: 'Zigbee lock',
  },
  39: {
    disabled: true,
    modelName: 'Zigbee light link remote',
  },
  40: {
    modelName: 'KAKU dimmable lightbulb',
    onOffFunction: 3,
    dimFunction: 4,
  },
  41: { //same as 33
    modelName: 'Zigbee (ledvance) smart plug',
    onOffFunction: 3,
  },
  42: {
    disabled: true,
    modelName: 'Zigbee lekkage sensor',
  },
  43: {
    disabled: true,
    modelName: 'KAKU wireless smoke detector ZSDR-850',
  },
  44: {
    disabled: true,
    modelName: 'Carbon monoxide sensor',
  },
  45: {
    disabled: true,
    modelName: 'Zigbee temperature and humidity sensor',
  },
  46: {
    disabled: true,
    modelName: 'Zigbee light group',
  },
  47: {
    disabled: true,
    modelName: 'Zigbee fire angel sensor',
  },
  48: {
    modelName: 'KAKU group with dimmable lightbulb',
    onOffFunction: 3,
    dimFunction: 4,
  },
  238: {disabled: true, modelName: 'P1 Module'},
  240: {disabled: true, modelName: 'Alarm Module'},
  241: {disabled: true, modelName: 'IPCam Module'},
  242: {disabled: true, modelName: 'Geofencing Module'},
  243: {disabled: true, modelName: 'System Module'},
};

export default deviceConfigs;
