import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CubeIcon,
  TruckIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, DashboardData } from '@/services/dashboardService';
import LoadingScreen from '@/components/ui/LoadingScreen';
import DashboardCard from '@/components/dashboard/DashboardCard';
import DashboardChart from '@/components/dashboard/DashboardChart';
import DashboardSummaryCard from '@/components/dashboard/DashboardSummaryCard';
import DashboardTable from '@/components/dashboard/DashboardTable';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [baseFilter, setBaseFilter] = useState<string | undefined>(
    user?.role === 'BaseCommander' ? user.assignedBase : undefined
  );
  const [assetTypeFilter, setAssetTypeFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      toast.error('You do not have permission to access this page');
      router.push('/assets');
    }
  }, [user, router]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (user?.role !== 'Admin') return;
    
    setIsLoading(true);
    try {
      const params: any = {};
      
      // Add filters to params if they exist
      if (baseFilter) params.base = baseFilter;
      if (assetTypeFilter) params.assetType = assetTypeFilter;
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      
      const dashboardData = await dashboardService.getDashboardData(params);
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchDashboardData();
    }
  }, [baseFilter, assetTypeFilter, dateRange.startDate, dateRange.endDate, user]);

  // Apply base filter for BaseCommander
  useEffect(() => {
    if (user?.role === 'BaseCommander' && user.assignedBase) {
      setBaseFilter(user.assignedBase);
    }
  }, [user]);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>Dashboard | Military Asset Management</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Filters */}
          <div className="mt-4 bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {user?.role !== 'BaseCommander' && (
                <div>
                  <label htmlFor="base" className="block text-sm font-medium text-gray-700">
                    Base
                  </label>
                  <select
                    id="base"
                    name="base"
                    className="mt-1 form-select"
                    value={baseFilter || ''}
                    onChange={(e) => setBaseFilter(e.target.value || undefined)}
                  >
                    <option value="">All Bases</option>
                    <option value="Base Alpha">Base Alpha</option>
                    <option value="Base Bravo">Base Bravo</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="assetType" className="block text-sm font-medium text-gray-700">
                  Asset Type
                </label>
                <select
                  id="assetType"
                  name="assetType"
                  className="mt-1 form-select"
                  value={assetTypeFilter || ''}
                  onChange={(e) => setAssetTypeFilter(e.target.value || undefined)}
                >
                  <option value="">All Types</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Weapon">Weapon</option>
                  <option value="Ammunition">Ammunition</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="date"
                    className="form-input"
                    value={dateRange.startDate || ''}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, startDate: e.target.value || undefined }))
                    }
                  />
                  <span className="self-center">to</span>
                  <input
                    type="date"
                    className="form-input"
                    value={dateRange.endDate || ''}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, endDate: e.target.value || undefined }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardSummaryCard
              title="Total Assets"
              value={data?.summary.totalAssets || 0}
              icon={<CubeIcon className="h-6 w-6 text-white" />}
              iconBg="bg-primary-600"
            />
            <DashboardSummaryCard
              title="Available"
              value={data?.summary.totalAvailable || 0}
              icon={<ArrowTrendingUpIcon className="h-6 w-6 text-white" />}
              iconBg="bg-green-600"
            />
            <DashboardSummaryCard
              title="Assigned"
              value={data?.summary.totalAssigned || 0}
              icon={<UserGroupIcon className="h-6 w-6 text-white" />}
              iconBg="bg-yellow-500"
            />
            <DashboardSummaryCard
              title="Expended"
              value={data?.summary.totalExpended || 0}
              icon={<ArrowTrendingDownIcon className="h-6 w-6 text-white" />}
              iconBg="bg-red-600"
            />
          </div>

          {/* Charts */}
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DashboardCard title="Assets by Type">
              <DashboardChart
                type="pie"
                data={{
                  labels: data?.assetsByType.map((item) => item.type) || [],
                  datasets: [
                    {
                      data: data?.assetsByType.map((item) => item.count) || [],
                      backgroundColor: [
                        '#3B82F6', // blue
                        '#10B981', // green
                        '#F59E0B', // yellow
                        '#EF4444', // red
                        '#8B5CF6', // purple
                      ],
                    },
                  ],
                }}
              />
            </DashboardCard>

            <DashboardCard title="Asset Availability">
              <DashboardChart
                type="bar"
                data={{
                  labels: data?.assetsByType.map((item) => item.type) || [],
                  datasets: [
                    {
                      label: 'Available',
                      data: data?.assetsByType.map((item) => item.available) || [],
                      backgroundColor: '#10B981',
                    },
                    {
                      label: 'Assigned',
                      data: data?.assetsByType.map((item) => item.assigned) || [],
                      backgroundColor: '#F59E0B',
                    },
                  ],
                }}
              />
            </DashboardCard>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DashboardCard
              title="Recent Transfers"
              action={
                <Link href="/transfers" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              }
            >
              <DashboardTable
                headers={['Asset', 'From', 'To', 'Quantity', 'Status', 'Date']}
                data={
                  data?.recentTransfers.map((transfer) => [
                    transfer.assetName || '',
                    transfer.fromBase || '',
                    transfer.toBase || '',
                    transfer.quantity?.toString() || '0',
                    <span
                      key={transfer._id}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transfer.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : transfer.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transfer.status}
                    </span>,
                    transfer.createdAt
                      ? format(new Date(transfer.createdAt), 'MMM d, yyyy')
                      : '',
                  ]) || []
                }
                icon={<TruckIcon className="h-5 w-5 text-gray-400" />}
                emptyMessage="No recent transfers"
              />
            </DashboardCard>

            <DashboardCard
              title="Recent Purchases"
              action={
                <Link href="/purchases" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              }
            >
              <DashboardTable
                headers={['Asset', 'Base', 'Quantity', 'Status', 'Date']}
                data={
                  data?.recentPurchases.map((purchase) => [
                    purchase.assetName || '',
                    purchase.base || '',
                    purchase.quantity?.toString() || '0',
                    <span
                      key={purchase._id}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        purchase.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : purchase.status === 'Ordered'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {purchase.status}
                    </span>,
                    purchase.purchaseDate
                      ? format(new Date(purchase.purchaseDate), 'MMM d, yyyy')
                      : '',
                  ]) || []
                }
                icon={<ShoppingCartIcon className="h-5 w-5 text-gray-400" />}
                emptyMessage="No recent purchases"
              />
            </DashboardCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DashboardCard
              title="Recent Assignments"
              action={
                <Link href="/assignments" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              }
            >
              <DashboardTable
                headers={['Asset', 'Assigned To', 'Quantity', 'Status', 'Date']}
                data={
                  data?.recentAssignments.map((assignment) => [
                    assignment.assetName || '',
                    assignment.assignedTo?.name || '',
                    assignment.quantity?.toString() || '0',
                    <span
                      key={assignment._id}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'Returned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {assignment.status}
                    </span>,
                    assignment.startDate
                      ? format(new Date(assignment.startDate), 'MMM d, yyyy')
                      : '',
                  ]) || []
                }
                icon={<UserGroupIcon className="h-5 w-5 text-gray-400" />}
                emptyMessage="No recent assignments"
              />
            </DashboardCard>

            <DashboardCard
              title="Recent Expenditures"
              action={
                <Link href="/expenditures" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              }
            >
              <DashboardTable
                headers={['Asset', 'Reason', 'Quantity', 'Date']}
                data={
                  data?.recentExpenditures.map((expenditure) => [
                    expenditure.assetName || '',
                    expenditure.reason || '',
                    expenditure.quantity?.toString() || '0',
                    expenditure.expenditureDate
                      ? format(new Date(expenditure.expenditureDate), 'MMM d, yyyy')
                      : '',
                  ]) || []
                }
                icon={<ArchiveBoxIcon className="h-5 w-5 text-gray-400" />}
                emptyMessage="No recent expenditures"
              />
            </DashboardCard>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;