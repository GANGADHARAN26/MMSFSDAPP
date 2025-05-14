import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { transferService } from '@/services/transferService';
import { useNotificationStore } from '@/stores/notificationStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { Transfer } from '@/types/transfer';
import toast from 'react-hot-toast';

const TransfersPage = () => {
  const { user } = useAuth();
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  // State for transfers list and pagination
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalTransfers, setTotalTransfers] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for sorting and filtering
  const [filters, setFilters] = useState({
    fromBase: user?.role === 'BaseCommander' ? user.assignedBase : '',
    toBase: '',
    status: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for action modals
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch transfers from API
  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        sortBy,
        sortOrder,
        limit,
        skip: (page - 1) * limit
      };
      
      // Add filters to params if they exist
      if (filters.fromBase) params.fromBase = filters.fromBase;
      if (filters.toBase) params.toBase = filters.toBase;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await transferService.getTransfers(params);
      setTransfers(response.transfers);
      setTotalTransfers(response.total);
      setHasMore(response.hasMore);
      
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to load transfers');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transfers when dependencies change
  useEffect(() => {
    fetchTransfers();
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

  // Handle approve transfer
  const openApproveModal = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setShowApproveModal(true);
  };

  const handleApproveTransfer = async () => {
    if (!selectedTransfer) return;
    
    setIsProcessing(true);
    try {
      const updatedTransfer = await transferService.approveTransfer(selectedTransfer._id);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Transfer Approved',
        message: `Transfer of ${updatedTransfer.quantity} ${updatedTransfer.assetName} has been approved.`
      });
      
      toast.success('Transfer approved successfully');
      
      // Close modal and refresh transfer list
      setShowApproveModal(false);
      setSelectedTransfer(null);
      fetchTransfers();
      
    } catch (error) {
      console.error('Error approving transfer:', error);
      toast.error('Failed to approve transfer');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel transfer
  const openCancelModal = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setShowCancelModal(true);
  };

  const handleCancelTransfer = async () => {
    if (!selectedTransfer) return;
    
    setIsProcessing(true);
    try {
      const updatedTransfer = await transferService.cancelTransfer(selectedTransfer._id);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Transfer Cancelled',
        message: `Transfer of ${updatedTransfer.quantity} ${updatedTransfer.assetName} has been cancelled.`
      });
      
      toast.success('Transfer cancelled successfully');
      
      // Close modal and refresh transfer list
      setShowCancelModal(false);
      setSelectedTransfer(null);
      fetchTransfers();
      
    } catch (error) {
      console.error('Error cancelling transfer:', error);
      toast.error('Failed to cancel transfer');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function for status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user can create transfers
  const canCreateTransfer = user?.role === 'Admin' || user?.role === 'LogisticsOfficer';
  
  // Check if user can approve transfers
  const canApproveTransfer = (transfer: Transfer) => {
    if (transfer.status !== 'Pending') return false;
    
    return user?.role === 'Admin' || 
      (user?.role === 'BaseCommander' && user.assignedBase === transfer.toBase);
  };
  
  // Check if user can cancel transfers
  const canCancelTransfer = (transfer: Transfer) => {
    if (transfer.status !== 'Pending') return false;
    
    return user?.role === 'Admin' || user?.role === 'LogisticsOfficer';
  };

  if (isLoading && transfers.length === 0) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>Transfers | Military Asset Management</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Transfers</h1>
            <div className="flex space-x-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
              {canCreateTransfer && (
                <Link href="/transfers/new" className="btn btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Transfer
                </Link>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 bg-white p-4 shadow rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="fromBase" className="block text-sm font-medium text-gray-700">
                    From Base
                  </label>
                  <select
                    id="fromBase"
                    name="fromBase"
                    className="mt-1 form-select"
                    value={filters.fromBase}
                    onChange={(e) => handleFilterChange({ ...filters, fromBase: e.target.value })}
                    disabled={user?.role === 'BaseCommander'}
                  >
                    <option value="">All Bases</option>
                    <option value="Base Alpha">Base Alpha</option>
                    <option value="Base Bravo">Base Bravo</option>
                    <option value="Base Charlie">Base Charlie</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="toBase" className="block text-sm font-medium text-gray-700">
                    To Base
                  </label>
                  <select
                    id="toBase"
                    name="toBase"
                    className="mt-1 form-select"
                    value={filters.toBase}
                    onChange={(e) => handleFilterChange({ ...filters, toBase: e.target.value })}
                  >
                    <option value="">All Bases</option>
                    <option value="Base Alpha">Base Alpha</option>
                    <option value="Base Bravo">Base Bravo</option>
                    <option value="Base Charlie">Base Charlie</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="mt-1 form-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
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
                    placeholder="Search by asset name, type, or base"
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
                      fromBase: user?.role === 'BaseCommander' ? user.assignedBase : '',
                      toBase: '',
                      status: '',
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

          {/* Transfers Table */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
            
            {!isLoading && transfers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transfers found. {canCreateTransfer && (
                  <Link href="/transfers/new" className="text-primary-600 hover:text-primary-900">
                    Create a new transfer
                  </Link>
                )}
              </div>
            )}
            
            {!isLoading && transfers.length > 0 && (
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
                        onClick={() => handleSort('fromBase')}
                      >
                        From
                        {sortBy === 'fromBase' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('toBase')}
                      >
                        To
                        {sortBy === 'toBase' && (
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
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortBy === 'status' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        Date
                        {sortBy === 'createdAt' && (
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
                    {transfers.map((transfer) => (
                      <tr key={transfer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link
                            href={`/assets/${transfer.asset}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {transfer.assetName}
                          </Link>
                          <p className="text-xs text-gray-500">{transfer.assetType}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transfer.fromBase}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transfer.toBase}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transfer.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              transfer.status
                            )}`}
                          >
                            {transfer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(transfer.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/transfers/${transfer._id}`}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            View
                          </Link>
                          {canApproveTransfer(transfer) && (
                            <button
                              className="text-green-600 hover:text-green-900 mr-4"
                              onClick={() => openApproveModal(transfer)}
                            >
                              Approve
                            </button>
                          )}
                          {canCancelTransfer(transfer) && (
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => openCancelModal(transfer)}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && transfers.length > 0 && (
              <Pagination
                currentPage={page}
                totalItems={totalTransfers}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Approve Transfer Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedTransfer(null);
        }}
        title="Approve Transfer"
        size="sm"
      >
        <div className="py-4">
          {selectedTransfer && (
            <p className="text-gray-700">
              Are you sure you want to approve the transfer of <span className="font-semibold">{selectedTransfer.quantity} {selectedTransfer.assetName}</span> from <span className="font-semibold">{selectedTransfer.fromBase}</span> to <span className="font-semibold">{selectedTransfer.toBase}</span>?
            </p>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowApproveModal(false);
                setSelectedTransfer(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleApproveTransfer}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Approve Transfer'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Transfer Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedTransfer(null);
        }}
        title="Cancel Transfer"
        size="sm"
      >
        <div className="py-4">
          {selectedTransfer && (
            <p className="text-gray-700">
              Are you sure you want to cancel the transfer of <span className="font-semibold">{selectedTransfer.quantity} {selectedTransfer.assetName}</span> from <span className="font-semibold">{selectedTransfer.fromBase}</span> to <span className="font-semibold">{selectedTransfer.toBase}</span>?
            </p>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowCancelModal(false);
                setSelectedTransfer(null);
              }}
              disabled={isProcessing}
            >
              No, Keep It
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancelTransfer}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Yes, Cancel Transfer'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TransfersPage;