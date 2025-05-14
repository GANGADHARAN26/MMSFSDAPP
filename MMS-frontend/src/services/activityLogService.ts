import { get } from './api';

export interface ActivityLogUser {
  _id: string;
  username: string;
  fullName: string;
  role: string;
}

export interface ActivityLog {
  _id: string;
  user: ActivityLogUser;
  username: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface ActivityLogResponse {
  logs: ActivityLog[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface ActionSummary {
  _id: string;
  count: number;
}

export interface ResourceSummary {
  _id: string;
  count: number;
}

export interface UserSummary {
  _id: string;
  count: number;
  lastActivity: string;
}

export interface DailySummary {
  date: string;
  count: number;
}

export const activityLogService = {
  // Get all activity logs with optional filters
  getActivityLogs: async (params?: any): Promise<ActivityLogResponse> => {
    return get<ActivityLogResponse>('/activity-logs', { params });
  },

  // Get a specific activity log by ID
  getActivityLogById: async (id: string): Promise<ActivityLog> => {
    return get<ActivityLog>(`/activity-logs/${id}`);
  },

  // Get activity logs for a specific user
  getUserActivityLogs: async (userId: string, params?: any): Promise<ActivityLogResponse> => {
    return get<ActivityLogResponse>(`/activity-logs/user/${userId}`, { params });
  },

  // Get activity logs for a specific resource
  getResourceActivityLogs: async (resourceType: string, resourceId: string, params?: any): Promise<ActivityLogResponse> => {
    return get<ActivityLogResponse>(`/activity-logs/resource/${resourceType}/${resourceId}`, { params });
  },

  // Get activity logs for a specific action
  getActionActivityLogs: async (action: string, params?: any): Promise<ActivityLogResponse> => {
    return get<ActivityLogResponse>(`/activity-logs/actions/${action}`, { params });
  },

  // Get summary of actions (count by action type)
  getActionsSummary: async (): Promise<ActionSummary[]> => {
    return get<ActionSummary[]>('/activity-logs/summary/actions');
  },

  // Get summary of resources (count by resource type)
  getResourcesSummary: async (): Promise<ResourceSummary[]> => {
    return get<ResourceSummary[]>('/activity-logs/summary/resources');
  },

  // Get summary of user activity (count by username)
  getUsersSummary: async (): Promise<UserSummary[]> => {
    return get<UserSummary[]>('/activity-logs/summary/users');
  },

  // Get daily activity summary for the last 30 days
  getDailySummary: async (): Promise<DailySummary[]> => {
    return get<DailySummary[]>('/activity-logs/summary/daily');
  }
};