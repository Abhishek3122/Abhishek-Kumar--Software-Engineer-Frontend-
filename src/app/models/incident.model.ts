export interface Incident {
  id: string;           // UUID or string from MongoDB
  title: string;
  service: string;
  severity: 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
  status: 'OPEN' | 'MITIGATED' | 'RESOLVED';
  owner?: string;
  summary?: string;
  createdAt: string;    // ISO string
  updatedAt: string;    // ISO string
}
