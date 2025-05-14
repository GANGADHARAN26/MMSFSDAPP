import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  PencilIcon,
  TruckIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { assetService } from '@/services/assetService';
import { useNotificationStore } from '@/stores/notificationStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import DashboardCard from '@/components/dashboard/DashboardCard';
import DashboardChart from '@/components/dashboard/DashboardChart';
import DashboardTable from '@/components/dashboard/DashboardTable';
import AssetStatusBadge from '@/components/assets/AssetStatusBadge';
import AssetActionButton from '@/components/assets/AssetActionButton';
import Modal from '@/components/ui/Modal';
import { Asset } from '@/types/asset';
import toast from 'react-hot-toast';

// Interface for related data
interface AssetDetails {
  asset: Asset;
  transfers: any[];
  purchases: any[];
  assignments: any[];
  expenditures: any[];
}

const AssetDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [assetData, setAssetData] = useState<AssetDetails | null>(null);
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch asset details
  useEffect(() => {
    if (!id) return;
    
    const fetchAssetDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch the asset
        const asset = await assetService.getAssetById(id as string);
        
        // For now, we'll use empty arrays for related data
        // In a real application, you would fetch these from their respective endpoints
        const assetDetails: AssetDetails = {
          asset,
          transfers: [],
          purchases: [],
          assignments: [],
          expenditures: [],
        };
        
        setAssetData(assetDetails);
      } catch (error) {
        console.error('Error fetching asset details:', error);
        toast.error('Failed to load asset details');
        router.push('/assets');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssetDetails();
  }, [id, router]);

  // Handle delete asset
  const handleDeleteAsset = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await assetService.deleteAsset(id as string);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Asset Deleted',
        message: `Asset has been deleted successfully.`
      });
      
      toast.success('Asset deleted successfully');
      router.push('/assets');
      
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading || !assetData) return <LoadingScreen />;

  const { asset, transfers, purchases, assignments, expenditures } = assetData;

  // Check if user has edit permissions
  const canEdit = user?.role === 'Admin' || user?.role === 'LogisticsOfficer';
  
  // Check if user has delete permissions (Admin only)
  const canDelete = user?.role === 'Admin';

  // Prepare chart data
  const movementChartData = {
    labels: ['Opening Balance', 'Purchases', 'Transfer In', 'Transfer Out', 'Assigned', 'Expended', 'Available'],
    datasets: [
      {
        label: 'Quantity',
        data: [
          asset.openingBalance,
          asset.purchases,
          asset.transferIn,
          asset.transferOut,
          asset.assigned,
          asset.expended,
          asset.available,
        ],
        backgroundColor: [
          '#3B82F6', // blue
          '#10B981', // green
          '#34D399', // light green
          '#F59E0B', // yellow
          '#FBBF24', // light yellow
          '#EF4444', // red
          '#6366F1', // indigo
        ],
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{asset.name} | Military Asset Management</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Back button and title */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">{asset.name}</h1>
            <div className="ml-auto flex space-x-2">
              {canEdit && (
                <Link
                  href={`/assets/${asset._id}/edit`}
                  className="btn btn-secondary btn-sm"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-danger btn-sm"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Asset summary */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Asset Details</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {asset.type} at {asset.base}
                </p>
              </div>
              <AssetStatusBadge available={asset.available} total={asset.closingBalance} />
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{asset.name}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{asset.type}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Base</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{asset.base}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Opening Balance</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {asset.openingBalance}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Closing Balance</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {asset.closingBalance}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Available</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {asset.available}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Assigned</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {asset.assigned}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(asset.createdAt), 'PPP')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <AssetActionButton
              icon={<TruckIcon className="h-5 w-5 mr-2" />}
              label="Transfer"
              href={`/transfers/new?asset=${asset._id}`}
              disabled={asset.available <= 0}
              tooltip={asset.available <= 0 ? 'No available quantity to transfer' : ''}
            />
            <AssetActionButton
              icon={<ShoppingCartIcon className="h-5 w-5 mr-2" />}
              label="Purchase"
              href={`/purchases/new?asset=${asset._id}`}
            />
            <AssetActionButton
              icon={<UserGroupIcon className="h-5 w-5 mr-2" />}
              label="Assign"
              href={`/assignments/new?asset=${asset._id}`}
              disabled={asset.available <= 0}
              tooltip={asset.available <= 0 ? 'No available quantity to assign' : ''}
            />
            <AssetActionButton
              icon={<ArchiveBoxIcon className="h-5 w-5 mr-2" />}
              label="Expend"
              href={`/expenditures/new?asset=${asset._id}`}
              disabled={asset.available <= 0}
              tooltip={asset.available <= 0 ? 'No available quantity to expend' : ''}
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`${
                  activeTab === 'transfers'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('transfers')}
              >
                Transfers
              </button>
              <button
                className={`${
                  activeTab === 'purchases'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('purchases')}
              >
                Purchases
              </button>
              <button
                className={`${
                  activeTab === 'assignments'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('assignments')}
              >
                Assignments
              </button>
              <button
                className={`${
                  activeTab === 'expenditures'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('expenditures')}
              >
                Expenditures
              </button>
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DashboardCard title="Asset Movement">
                <DashboardChart type="bar" data={movementChartData} />
              </DashboardCard>
              <DashboardCard title="Asset Timeline">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {[...(transfers || []), ...(purchases || []), ...(assignments || []), ...(expenditures || [])]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((item, index) => {
                        let icon;
                        let title;
                        let description;
                        let color;

                        if ('fromBase' in item) {
                          // Transfer
                          icon = <TruckIcon className="h-5 w-5" />;
                          title = `Transferred from ${item.fromBase} to ${item.toBase}`;
                          description = `Quantity: ${item.quantity}, Status: ${item.status}`;
                          color = 'bg-blue-500';
                        } else if ('supplier' in item) {
                          // Purchase
                          icon = <ShoppingCartIcon className="h-5 w-5" />;
                          title = `Purchased from ${item.supplier}`;
                          description = `Quantity: ${item.quantity}, Status: ${item.status}`;
                          color = 'bg-green-500';
                        } else if ('assignedTo' in item) {
                          // Assignment
                          icon = <UserGroupIcon className="h-5 w-5" />;
                          title = `Assigned to ${item.assignedTo.name}`;
                          description = `Quantity: ${item.quantity}, Status: ${item.status}`;
                          color = 'bg-yellow-500';
                        } else if ('reason' in item) {
                          // Expenditure
                          icon = <ArchiveBoxIcon className="h-5 w-5" />;
                          title = `Expended for ${item.reason}`;
                          description = `Quantity: ${item.quantity}`;
                          color = 'bg-red-500';
                        }

                        return (
                          <li key={item._id}>
                            <div className="relative pb-8">
                              {index !== 4 && (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                  aria-hidden="true"
                                />
                              )}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${color}`}>
                                    <span className="text-white">{icon}</span>
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      {title}{' '}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {description}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    {format(new Date(item.createdAt), 'MMM d, yyyy')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </DashboardCard>
            </div>
          )}

          {activeTab === 'transfers' && (
            <DashboardCard
              title="Transfers"
              action={
                <Link href={`/transfers/new?asset=${asset._id}`} className="btn btn-primary btn-sm">
                  New Transfer
                </Link>
              }
            >
              <DashboardTable
                headers={['From', 'To', 'Quantity', 'Status', 'Date', 'Transferred By']}
                data={
                  (transfers || []).map((transfer) => [
                    transfer.fromBase,
                    transfer.toBase,
                    transfer.quantity.toString(),
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
                    format(new Date(transfer.createdAt), 'MMM d, yyyy'),
                    transfer.transferredBy?.fullName || 'N/A',
                  ])
                }
                icon={<TruckIcon className="h-5 w-5 text-gray-400" />}
                emptyMessage="No transfers found"
              />
            </DashboardCard>
          )}

          {activeTab === 'purchases' && (
            <DashboardCard
              title="Purchases"
              action={
                <Link href={`/purchases/new?asset=${asset._id}`} className="btn btn-primary btn-sm">
                  New Purchase
                </Link>
              }
            >
              <DashboardTable
                headers={['Supplier', 'Quantity', 'Unit Cost', 'Total Cost', 'Status', 'Date']}
                data={
                  (purchases || []).map((purchase) => [
                    purchase.supplier,
                    purchase.quantity.toString(),
                    `$${purchase.unitCost.toFixed(2)}`,
                    `$${purchase.totalCost.toFixed(2)}`,
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
                    format(new Date(purchase.purchaseDate), 'MMM d, yyyy'),
                  ])
                }
                icon={<ShoppingCartIcon className="h-5 w-5 text-gray-400" />}
                emptyMessage="No purchases found"
              />
            </DashboardCard>
          )}

          {activeTab === 'assignments' && (
            <DashboardCard
              title="Assignments"
              action={
                <Link href={`/assignments/new?asset=${asset._id}`} className="btn btn-primary btn-sm">
                  New Assignment
                </Link>
              }
            >
              <DashboardTable
                headers={['Assigned To', 'Quantity', 'Purpose', 'Status', 'Start Date', 'End Date']}
                data={
                  (assignments || []).map((assignment) => [
                    `${assignment.assignedTo.name} (${assignment.assignedTo.rank})`,
                    assignment.quantity.toString(),
                    assignment.purpose,
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
                    format(new Date(assignment.startDate), 'MMM d, yyyy'),
                    assignment.endDate
                      ? format(new Date(assignment.endDate), 'MMM d, yyyy')
                      : 'N/A',
                  ])
                }
                icon={<UserGroupIcon className="h-5 w-5 text-gray-400" />}
                emptyMessage="No assignments found"
              />
            </DashboardCard>
          )}

          {activeTab === 'expenditures' && (
            <DashboardCard
              title="Expenditures"
              action={
                <Link href={`/expenditures/new?asset=${asset._id}`} className="btn btn-primary btn-sm">
                  New Expenditure
                </Link>
              }
            >
              <DashboardTable
                headers={['Reason', 'Quantity', 'Expended By', 'Operation', 'Location', 'Date']}
                data={
                  (expenditures || []).map((expenditure) => [
                    expenditure.reason,
                    expenditure.quantity.toString(),
                    `${expenditure.expendedBy.name} (${expenditure.expendedBy.rank})`,
                    expenditure.operationName || 'N/A',
                    expenditure.location || 'N/A',
                    format(new Date(expenditure.expenditureDate), 'MMM d, yyyy'),
                  ])
                }
                icon={<ArchiveBoxIcon className="h-5 w-5 text-gray-400" />}
                emptyMessage="No expenditures found"
              />
            </DashboardCard>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Asset"
        size="sm"
      >
        <div className="py-4">
          <p className="text-gray-700">
            Are you sure you want to delete <span className="font-semibold">{asset.name}</span>?
            This action cannot be undone.
          </p>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteAsset}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Delete Asset'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssetDetailPage;