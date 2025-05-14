import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { purchaseService } from '@/services/purchaseService';
import { useNotificationStore } from '@/stores/notificationStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Modal from '@/components/ui/Modal';
import { Purchase } from '@/types/purchase';
import toast from 'react-hot-toast';

const PurchaseDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [isLoading, setIsLoading] = useState(true);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  
  // State for action modals
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch purchase details
  useEffect(() => {
    if (!id) return;

    const fetchPurchase = async () => {
      setIsLoading(true);
      try {
        const data = await purchaseService.getPurchaseById(id as string);
        setPurchase(data);
      } catch (error) {
        console.error('Error fetching purchase:', error);
        toast.error('Failed to load purchase details');
        router.push('/purchases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchase();
  }, [id, router]);

  // Handle mark as delivered
  const handleMarkDelivered = async () => {
    if (!id) return;
    
    setIsProcessing(true);
    try {
      const updatedPurchase = await purchaseService.markAsDelivered(id as string);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Purchase Delivered',
        message: `${updatedPurchase.quantity} ${updatedPurchase.assetName} marked as delivered.`
      });
      
      toast.success('Purchase marked as delivered successfully');
      
      // Update the local state to reflect the change
      setPurchase(updatedPurchase);
      setShowDeliverModal(false);
      
    } catch (error) {
      console.error('Error marking purchase as delivered:', error);
      toast.error('Failed to mark purchase as delivered');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel purchase
  const handleCancel = async () => {
    if (!id) return;
    
    setIsProcessing(true);
    try {
      const updatedPurchase = await purchaseService.cancelPurchase(id as string);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Purchase Cancelled',
        message: `Purchase of ${updatedPurchase.quantity} ${updatedPurchase.assetName} has been cancelled.`
      });
      
      toast.success('Purchase cancelled successfully');
      
      // Update the local state to reflect the change
      setPurchase(updatedPurchase);
      setShowCancelModal(false);
      
    } catch (error) {
      console.error('Error cancelling purchase:', error);
      toast.error('Failed to cancel purchase');
    } finally {
      setIsProcessing(false);
    }
  };

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

  // Check if user can mark as delivered
  const canMarkAsDelivered = () => {
    if (!purchase || !user) return false;
    if (purchase.status !== 'Ordered') return false;
    
    return user.role === 'Admin' || 
      (user.role === 'LogisticsOfficer') ||
      (user.role === 'BaseCommander' && user.assignedBase === purchase.base);
  };
  
  // Check if user can cancel purchases
  const canCancelPurchase = () => {
    if (!purchase || !user) return false;
    if (purchase.status !== 'Ordered') return false;
    
    return user.role === 'Admin' || user.role === 'LogisticsOfficer';
  };

  if (isLoading) return <LoadingScreen />;

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Purchase not found</h2>
          <p className="mt-2 text-gray-600">The purchase you're looking for doesn't exist</p>
          <Link href="/purchases" className="mt-4 btn btn-primary">
            Back to Purchases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Purchase Details | Military Asset Management</title>
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
            <h1 className="text-2xl font-semibold text-gray-900">Purchase Details</h1>
            <span
              className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                purchase.status
              )}`}
            >
              {purchase.status}
            </span>
          </div>

          {/* Purchase details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {purchase.assetName} Purchase
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {purchase.quantity} units from {purchase.supplier}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Asset</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Link
                      href={`/assets/${purchase.asset}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {purchase.assetName}
                    </Link>
                    <p className="text-xs text-gray-500">{purchase.assetType}</p>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Base</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {purchase.base}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Supplier</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {purchase.supplier}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {purchase.quantity}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Unit Cost</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${purchase.unitCost.toLocaleString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${purchase.totalCost.toLocaleString()}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {purchase.invoiceNumber || 'N/A'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        purchase.status
                      )}`}
                    >
                      {purchase.status}
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Purchased By</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {purchase.purchasedBy.fullName}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(purchase.purchaseDate), 'PPP p')}
                  </dd>
                </div>
                {purchase.deliveryDate && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Delivery Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {format(new Date(purchase.deliveryDate), 'PPP p')}
                    </dd>
                  </div>
                )}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(purchase.createdAt), 'PPP p')}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(purchase.updatedAt), 'PPP p')}
                  </dd>
                </div>
                {purchase.notes && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {purchase.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-4">
            {canCancelPurchase() && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowCancelModal(true)}
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel Purchase
              </button>
            )}
            {canMarkAsDelivered() && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => setShowDeliverModal(true)}
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mark as Delivered Modal */}
      <Modal
        isOpen={showDeliverModal}
        onClose={() => setShowDeliverModal(false)}
        title="Mark Purchase as Delivered"
        size="sm"
      >
        <div className="py-4">
          <p className="text-gray-700">
            Are you sure you want to mark the purchase of <span className="font-semibold">{purchase?.quantity} {purchase?.assetName}</span> as delivered?
          </p>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowDeliverModal(false)}
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
        onClose={() => setShowCancelModal(false)}
        title="Cancel Purchase"
        size="sm"
      >
        <div className="py-4">
          <p className="text-gray-700">
            Are you sure you want to cancel the purchase of <span className="font-semibold">{purchase?.quantity} {purchase?.assetName}</span>?
          </p>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCancelModal(false)}
              disabled={isProcessing}
            >
              No, Keep It
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancel}
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

export default PurchaseDetailPage;