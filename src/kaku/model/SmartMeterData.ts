export default interface SmartMeterData {
  powerConsumedLowTariff: number;
  powerConsumed: number;
  powerProducedLowTariff: number;
  powerProduced: number;
  currentConsumption: number;
  currentProduction: number;
  gas: number;
  rawDataArray: number[];
}
