export default interface DeviceData {
  home_id: string;
  id: string;
  name: string;
  device: number;
  isGroup: boolean;
  status: {
    module: {
      id: number;
      functions: number[];
    };
  };
  data: {
    module: {
      id: number;
      version: number;
      name: string;
      device: number;
      info: number[];
    };
  };
}
