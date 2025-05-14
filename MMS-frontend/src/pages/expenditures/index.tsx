import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { expenditureService } from '@/services/expenditureService';
import { useNotificationStore } from '@/stores/notificationStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Pagination from '@/components/ui/Pagination';
import { Expenditure } from '@/types/expenditure';
import toast from 'react-hot-toast';

const ExpendituresPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  // State for expenditures list and pagination
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalExpenditures, setTotalExpenditures] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for sorting and filtering
  const [filters, setFilters] = useState({
    base: user?.role === 'BaseCommander' ? user.assignedBase : '',
    assetType: '',
    reason: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState('expenditureDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch expenditures from API
  const fetchExpenditures = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        sortBy,
        sortOrder,
        limit,
        skip: (page - 1) * limit
      };
      
      // Add filters to params if they exist
      if (filters.base) params.base = filters.base;
      if (filters.assetType) params.assetType = filters.assetType;
      if (filters.reason) params.reason = filters.reason;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.search) params.search = filters.search;
      
      const response = await expenditureService.getExpenditures(params);
      setExpenditures(response.expenditures);
      setTotalExpenditures(response.total);
      setHasMore(response.hasMore);
      
    } catch (error) {
      console.error('Error fetching expenditures:', error);
      toast.error('Failed to load expenditures');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch expenditures when dependencies change
  useEffect(() => {
    fetchExpenditures();
  }, [filters, sortBy, sortOrder, page, limit, user]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  // Check if user can create expenditures
  const canCreateExpenditure = user?.role === 'Admin' || 
    user?.role === 'BaseCommander' || 
    user?.role === 'LogisticsOfficer';

  // Get reason badge class
  const getReasonBadgeClass = (reason: string) => {
    switch (reason) {
      case 'Training':
        return 'bg-blue-100 text-blue-800';
      case 'Operation':
        return 'bg-purple-100 text-purple-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Damaged':
        return 'bg-orange-100 text-orange-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading && expenditures.length === 0) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>Expenditures | Military Asset Management</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Expenditures</h1>
            <div className="flex space-x-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
              {canCreateExpenditure && (
                <Link href="/expenditures/new" className="btn btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Expenditure
                </Link>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 bg-white p-4 shadow rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="base" className="block text-sm font-medium text-gray-700">
                    Base
                  </label>
                  <select
                    id="base"
                    name="base"
                    className="mt-1 form-select"
                    value={filters.base}
                    onChange={(e) => handleFilterChange({ ...filters, base: e.target.value })}
                    disabled={user?.role === 'BaseCommander'}
                  >
                    <option value="">All Bases</option>
                    <option value="Base Alpha">Base Alpha</option>
                    <option value="Base Bravo">Base Bravo</option>
                    <option value="Base Charlie">Base Charlie</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="assetType" className="block text-sm font-medium text-gray-700">
                    Asset Type
                  </label>
                  <select
                    id="assetType"
                    name="assetType"
                    className="mt-1 form-select"
                    value={filters.assetType}
                    onChange={(e) => handleFilterChange({ ...filters, assetType: e.target.value })}
                  >
                    <option value="">All Types</option>
                    <option value="Weapon">Weapon</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Ammunition">Ammunition</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                    Reason
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    className="mt-1 form-select"
                    value={filters.reason}
                    onChange={(e) => handleFilterChange({ ...filters, reason: e.target.value })}
                  >
                    <option value="">All Reasons</option>
                    <option value="Training">Training</option>
                    <option value="Operation">Operation</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="mt-1 form-input"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="mt-1 form-input"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange({ ...filters, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                    Search
                  </label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    className="mt-1 form-input"
                    placeholder="Search by asset name, operation, or personnel"
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={() => {
                    setFilters({
                      base: user?.role === 'BaseCommander' ? user.assignedBase : '',
                      assetType: '',
                      reason: '',
                      startDate: '',
                      endDate: '',
                      search: '',
                    });
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowFilters(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Expenditures Table */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
            
            {!isLoading && expenditures.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No expenditures found. {canCreateExpenditure && (
                  <Link href="/expenditures/new" className="text-primary-600 hover:text-primary-900">
                    Create a new expenditure
                  </Link>
                )}
              </div>
            )}
            
            {!isLoading && expenditures.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('assetName')}
                      >
                        Asset
                        {sortBy === 'assetName' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('base')}
                      >
                        Base
                        {sortBy === 'base' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('quantity')}
                      >
                        Quantity
                        {sortBy === 'quantity' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('reason')}
                      >
                        Reason
                        {sortBy === 'reason' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('expendedBy.name')}
                      >
                        Expended By
                        {sortBy === 'expendedBy.name' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('expenditureDate')}
                      >
                        Date
                        {sortBy === 'expenditureDate' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenditures.map((expenditure) => (
                      <tr key={expenditure._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link
                            href={`/assets/${expenditure.asset}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {expenditure.assetName}
                          </Link>
                          <p className="text-xs text-gray-500">{expenditure.assetType}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expenditure.base}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expenditure.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonBadgeClass(
                              expenditure.reason
                            )}`}
                          >
                            {expenditure.reason}
                          </span>
                          {expenditure.operationName && (
                            <p className="text-xs text-gray-500 mt-1">{expenditure.operationName}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {expenditure.expendedBy.name}
                            <p className="text-xs text-gray-500">{expenditure.expendedBy.rank}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(expenditure.expenditureDate), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/expenditures/${expenditure._id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && expenditures.length > 0 && (
              <Pagination
                currentPage={page}
                totalItems={totalExpenditures}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpendituresPage;