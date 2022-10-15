import DeviceConfig from './model/DeviceConfig';

// Defaults
// Switch: onOffFunction: 0
// Switch zigbee: onOffFunction: 3
// Dimmable: dimFunction 1
// Dimmable zigbee: dimFunction 4
// Color temp: onOffFunction: 3, dimFunction 4, colorTemperatureFunction 9

const deviceConfigs: Record<number, DeviceConfig> = {
  1: {
    name: 'KAKU Smartplug',
    onOffFunction: 0,
  },
  2: { // DeviceType 2 uses 0 to 15 for dim values
    name: 'KAKU dimmable',
    onOffFunction: 0,
    dimFunction: 1,
    maxBrightness: 15,
  },
  4: {
    disabled: true,
    name: 'Trust wireless motion detector for outdoor use',
  },
  6: {
    disabled: true,
    name: 'Doorbell button',
  },
  13: {
    disabled: true,
    name: 'KAKU doorbell gong/ speaker',
  },
  14: {
    disabled: true,
    name: 'Ambient light sensor',
  },
  24: {
    name: 'KAKU dimmable lightbulb',
    onOffFunction: 3,
    dimFunction: 4,
  },
  26: {
    disabled: true,
    name: 'KAKU 2 button wireless wall switch',
  },
  33: { // 0 for onOff not working, maybe this,
    name: 'Zigbee (ledvance) smart plug',
    onOffFunction: 3,
  },
  34: { // not tested
    name: 'Dimmable',
    onOffFunction: 3,
    dimFunction: 4,
  },
  36: {
    name: 'Zigbee (ledvance) dimmable with color temperature',
    onOffFunction: 3,
    dimFunction: 4,
    colorTemperatureFunction: 9,
  },
  40: {
    name: 'KAKU dimmable lightbulb',
    onOffFunction: 3,
    dimFunction: 4,
  },
  41: { //same as 33
    name: 'Zigbee (ledvance) smart plug',
    onOffFunction: 3,
  },
  48: {
    name: 'KAKU group with dimmable lightbulb',
    onOffFunction: 3,
    dimFunction: 4,
  },
  238: {disabled: true, name: 'P1 Module'},
  240: {disabled: true, name: 'Alarm Module'},
  241: {disabled: true, name: 'IPCam Module'},
  242: {disabled: true, name: 'Geofencing Module'},
  243: {disabled: true, name: 'System Module'},
};

export default deviceConfigs;
