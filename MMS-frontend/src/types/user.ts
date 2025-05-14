export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'BaseCommander' | 'LogisticsOfficer';
  assignedBase?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}