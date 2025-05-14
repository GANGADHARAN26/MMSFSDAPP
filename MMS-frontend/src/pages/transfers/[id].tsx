import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { transferService } from '@/services/transferService';
import { useNotificationStore } from '@/stores/notificationStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Modal from '@/components/ui/Modal';
import { Transfer } from '@/types/transfer';
import toast from 'react-hot-toast';

const TransferDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [isLoading, setIsLoading] = useState(true);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  
  // State for action modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch transfer details
  useEffect(() => {
    if (!id) return;

    const fetchTransfer = async () => {
      setIsLoading(true);
      try {
        const data = await transferService.getTransferById(id as string);
        setTransfer(data);
      } catch (error) {
        console.error('Error fetching transfer:', error);
        toast.error('Failed to load transfer details');
        router.push('/transfers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransfer();
  }, [id, router]);

  // Handle approve transfer
  const handleApprove = async () => {
    if (!id) return;
    
    setIsProcessing(true);
    try {
      const updatedTransfer = await transferService.approveTransfer(id as string);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Transfer Approved',
        message: `Transfer of ${updatedTransfer.quantity} ${updatedTransfer.assetName} has been approved.`
      });
      
      toast.success('Transfer approved successfully');
      
      // Update the local state to reflect the change
      setTransfer(updatedTransfer);
      setShowApproveModal(false);
      
    } catch (error) {
      console.error('Error approving transfer:', error);
      toast.error('Failed to approve transfer');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel transfer
  const handleCancel = async () => {
    if (!id) return;
    
    setIsProcessing(true);
    try {
      const updatedTransfer = await transferService.cancelTransfer(id as string);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Transfer Cancelled',
        message: `Transfer of ${updatedTransfer.quantity} ${updatedTransfer.assetName} has been cancelled.`
      });
      
      toast.success('Transfer cancelled successfully');
      
      // Update the local state to reflect the change
      setTransfer(updatedTransfer);
      setShowCancelModal(false);
      
    } catch (error) {
      console.error('Error cancelling transfer:', error);
      toast.error('Failed to cancel transfer');
    } finally {
      setIsProcessing(false);
    }
  };

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

  // Check if user can approve transfers
  const canApprove = () => {
    if (!transfer || !user) return false;
    if (transfer.status !== 'Pending') return false;
    
    return user.role === 'Admin' || 
      (user.role === 'BaseCommander' && user.assignedBase === transfer.toBase);
  };
  
  // Check if user can cancel transfers
  const canCancel = () => {
    if (!transfer || !user) return false;
    if (transfer.status !== 'Pending') return false;
    
    return user.role === 'Admin' || user.role === 'LogisticsOfficer';
  };

  if (isLoading) return <LoadingScreen />;

  if (!transfer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Transfer not found</h2>
          <p className="mt-2 text-gray-600">The transfer you're looking for doesn't exist</p>
          <Link href="/transfers" className="mt-4 btn btn-primary">
            Back to Transfers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Transfer Details | Military Asset Management</title>
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
            <h1 className="text-2xl font-semibold text-gray-900">Transfer Details</h1>
            <span
              className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                transfer.status
              )}`}
            >
              {transfer.status}
            </span>
          </div>

          {/* Transfer details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {transfer.assetName} Transfer
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                From {transfer.fromBase} to {transfer.toBase}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Asset</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Link
                      href={`/assets/${transfer.asset}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {transfer.assetName}
                    </Link>
                    <p className="text-xs text-gray-500">{transfer.assetType}</p>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">From Base</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {transfer.fromBase}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">To Base</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {transfer.toBase}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {transfer.quantity}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        transfer.status
                      )}`}
                    >
                      {transfer.status}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Transferred By</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {transfer.transferredBy.fullName}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(transfer.createdAt), 'PPP p')}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(transfer.updatedAt), 'PPP p')}
                  </dd>
                </div>
                {transfer.notes && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {transfer.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-4">
            {canCancel() && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowCancelModal(true)}
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel Transfer
              </button>
            )}
            {canApprove() && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => setShowApproveModal(true)}
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Approve Transfer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Approve Transfer Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Transfer"
        size="sm"
      >
        <div className="py-4">
          <p className="text-gray-700">
            Are you sure you want to approve the transfer of <span className="font-semibold">{transfer.quantity} {transfer.assetName}</span> from <span className="font-semibold">{transfer.fromBase}</span> to <span className="font-semibold">{transfer.toBase}</span>?
          </p>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowApproveModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleApprove}
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
        onClose={() => setShowCancelModal(false)}
        title="Cancel Transfer"
        size="sm"
      >
        <div className="py-4">
          <p className="text-gray-700">
            Are you sure you want to cancel the transfer of <span className="font-semibold">{transfer.quantity} {transfer.assetName}</span> from <span className="font-semibold">{transfer.fromBase}</span> to <span className="font-semibold">{transfer.toBase}</span>?
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
                'Yes, Cancel Transfer'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TransferDetailPage;