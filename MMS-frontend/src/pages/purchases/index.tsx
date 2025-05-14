import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { purchaseService } from '@/services/purchaseService';
import { useNotificationStore } from '@/stores/notificationStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { Purchase } from '@/types/purchase';
import toast from 'react-hot-toast';

const PurchasesPage = () => {
  const { user } = useAuth();
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  // State for purchases list and pagination
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for sorting and filtering
  const [filters, setFilters] = useState({
    base: user?.role === 'BaseCommander' ? user.assignedBase : '',
    assetType: '',
    status: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState('purchaseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for action modals
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch purchases from API
  const fetchPurchases = async () => {
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
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await purchaseService.getPurchases(params);
      setPurchases(response.purchases);
      setTotalPurchases(response.total);
      setHasMore(response.hasMore);
      
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to load purchases');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch purchases when dependencies change
  useEffect(() => {
    fetchPurchases();
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

  // Handle mark as delivered
  const openDeliverModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDeliverModal(true);
  };

  const handleMarkDelivered = async () => {
    if (!selectedPurchase) return;
    
    setIsProcessing(true);
    try {
      const updatedPurchase = await purchaseService.markAsDelivered(selectedPurchase._id);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Purchase Delivered',
        message: `${updatedPurchase.quantity} ${updatedPurchase.assetName} marked as delivered.`
      });
      
      toast.success('Purchase marked as delivered successfully');
      
      // Close modal and refresh purchase list
      setShowDeliverModal(false);
      setSelectedPurchase(null);
      fetchPurchases();
      
    } catch (error) {
      console.error('Error marking purchase as delivered:', error);
      toast.error('Failed to mark purchase as delivered');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel purchase
  const openCancelModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowCancelModal(true);
  };

  const handleCancelPurchase = async () => {
    if (!selectedPurchase) return;
    
    setIsProcessing(true);
    try {
      const updatedPurchase = await purchaseService.cancelPurchase(selectedPurchase._id);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Purchase Cancelled',
        message: `Purchase of ${updatedPurchase.quantity} ${updatedPurchase.assetName} has been cancelled.`
      });
      
      toast.success('Purchase cancelled successfully');
      
      // Close modal and refresh purchase list
      setShowCancelModal(false);
      setSelectedPurchase(null);
      fetchPurchases();
      
    } catch (error) {
      console.error('Error cancelling purchase:', error);
      toast.error('Failed to cancel purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function for status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Ordered':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user can create purchases
  const canCreatePurchase = user?.role === 'Admin' || user?.role === 'LogisticsOfficer';
  
  // Check if user can mark as delivered
  const canMarkAsDelivered = (purchase: Purchase) => {
    if (purchase.status !== 'Ordered') return false;
    
    return user?.role === 'Admin' || 
      (user?.role === 'LogisticsOfficer') ||
      (user?.role === 'BaseCommander' && user.assignedBase === purchase.base);
  };
  
  // Check if user can cancel purchases
  const canCancelPurchase = (purchase: Purchase) => {
    if (purchase.status !== 'Ordered') return false;
    
    return user?.role === 'Admin' || user?.role === 'LogisticsOfficer';
  };

  if (isLoading && purchases.length === 0) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>Purchases | Military Asset Management</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Purchases</h1>
            <div className="flex space-x-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
              {canCreatePurchase && (
                <Link href="/purchases/new" className="btn btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Purchase
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
                    <option value="Ordered">Ordered</option>
                    <option value="Delivered">Delivered</option>
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
                    placeholder="Search by asset name, type, supplier, or invoice number"
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

          {/* Purchases Table */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
            
            {!isLoading && purchases.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No purchases found. {canCreatePurchase && (
                  <Link href="/purchases/new" className="text-primary-600 hover:text-primary-900">
                    Create a new purchase
                  </Link>
                )}
              </div>
            )}
            
            {!isLoading && purchases.length > 0 && (
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
                        onClick={() => handleSort('supplier')}
                      >
                        Supplier
                        {sortBy === 'supplier' && (
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
                        onClick={() => handleSort('totalCost')}
                      >
                        Total Cost
                        {sortBy === 'totalCost' && (
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
                        onClick={() => handleSort('purchaseDate')}
                      >
                        Date
                        {sortBy === 'purchaseDate' && (
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
                    {purchases.map((purchase) => (
                      <tr key={purchase._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link
                            href={`/assets/${purchase.asset}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {purchase.assetName}
                          </Link>
                          <p className="text-xs text-gray-500">{purchase.assetType}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {purchase.base}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {purchase.supplier}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {purchase.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${purchase.totalCost.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              purchase.status
                            )}`}
                          >
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(purchase.purchaseDate), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/purchases/${purchase._id}`}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            View
                          </Link>
                          {canMarkAsDelivered(purchase) && (
                            <button
                              className="text-green-600 hover:text-green-900 mr-4"
                              onClick={() => openDeliverModal(purchase)}
                            >
                              Mark Delivered
                            </button>
                          )}
                          {canCancelPurchase(purchase) && (
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => openCancelModal(purchase)}
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
            {!isLoading && purchases.length > 0 && (
              <Pagination
                currentPage={page}
                totalItems={totalPurchases}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mark as Delivered Modal */}
      <Modal
        isOpen={showDeliverModal}
        onClose={() => {
          setShowDeliverModal(false);
          setSelectedPurchase(null);
        }}
        title="Mark Purchase as Delivered"
        size="sm"
      >
        <div className="py-4">
          {selectedPurchase && (
            <p className="text-gray-700">
              Are you sure you want to mark the purchase of <span className="font-semibold">{selectedPurchase.quantity} {selectedPurchase.assetName}</span> as delivered?
            </p>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowDeliverModal(false);
                setSelectedPurchase(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleMarkDelivered}
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
                'Mark as Delivered'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Purchase Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedPurchase(null);
        }}
        title="Cancel Purchase"
        size="sm"
      >
        <div className="py-4">
          {selectedPurchase && (
            <p className="text-gray-700">
              Are you sure you want to cancel the purchase of <span className="font-semibold">{selectedPurchase.quantity} {selectedPurchase.assetName}</span>?
            </p>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowCancelModal(false);
                setSelectedPurchase(null);
              }}
              disabled={isProcessing}
            >
              No, Keep It
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancelPurchase}
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
                'Yes, Cancel Purchase'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PurchasesPage;