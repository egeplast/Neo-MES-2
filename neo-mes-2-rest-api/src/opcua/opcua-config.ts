export interface OpcuaEndpoint {
  name: string;
  url: string;
  type: 'linie' | 'silo';
}

export const OPCUA_ENDPOINTS: OpcuaEndpoint[] = [
  { name: 'Motan_Convey', url: 'opc.tcp://10.2.20.11:4840', type: 'silo' },
  { name: 'Linie_201', url: 'opc.tcp://10.2.201.10:4840', type: 'linie' },
  { name: 'Linie_203', url: 'opc.tcp://10.2.203.10:4840', type: 'linie' },
  { name: 'Linie_205', url: 'opc.tcp://10.2.205.10:4840', type: 'linie' },
];
