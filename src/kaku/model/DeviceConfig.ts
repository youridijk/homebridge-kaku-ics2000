export default interface DeviceConfig {
  readonly disabled?: true; // for sensors
  readonly name: string;
  readonly onOffFunction?: number;
  readonly dimFunction?: number;
  readonly colorTemperatureFunction?: number;

  readonly maxBrightness?: number;
  readonly maxColorTemperature?: number;
}
