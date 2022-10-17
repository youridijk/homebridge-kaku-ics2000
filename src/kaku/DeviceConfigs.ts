import DeviceConfig from './model/DeviceConfig';

// Defaults
// Switch: onOffFunction: 0
// Switch zigbee: onOffFunction: 3
// Dimmable: dimFunction 1
// Dimmable zigbee: dimFunction 4
// Color temp: onOffFunction: 3, dimFunction 4, colorTemperatureFunction 9

const deviceConfigs: Record<number, DeviceConfig> = {
  1: {
    modelName: 'KAKU Smartplug',
    onOffFunction: 0,
  },
  2: { // DeviceType 2 uses 0 to 15 for dim values
    modelName: 'KAKU dimmable',
    onOffFunction: 0,
    dimFunction: 1,
    maxBrightness: 15,
  },
  4: {
    disabled: true,
    modelName: 'Trust wireless motion detector for outdoor use',
  },
  6: {
    disabled: true,
    modelName: 'Doorbell button',
  },
  13: {
    disabled: true,
    modelName: 'KAKU doorbell gong/ speaker',
  },
  14: {
    disabled: true,
    modelName: 'Ambient light sensor',
  },
  24: {
    modelName: 'KAKU dimmable lightbulb',
    onOffFunction: 0,
    dimFunction: 1,
    maxBrightness: 15,
  },
  26: {
    disabled: true,
    modelName: 'KAKU 2 button wireless wall switch',
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
  36: {
    modelName: 'Zigbee (ledvance) dimmable with color temperature',
    onOffFunction: 3,
    dimFunction: 4,
    colorTemperatureFunction: 9,
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
  43: {
    disabled: true,
    modelName: 'KAKU wireless smoke detector ZSDR-850',
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
