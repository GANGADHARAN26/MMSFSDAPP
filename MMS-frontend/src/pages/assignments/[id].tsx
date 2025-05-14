import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import { useNotificationStore } from '@/stores/notificationStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Modal from '@/components/ui/Modal';
import { Assignment } from '@/types/assignment';
import toast from 'react-hot-toast';

const AssignmentDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [isLoading, setIsLoading] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  
  // State for modals
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [returnQuantity, setReturnQuantity] = useState(0);
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch assignment details
  useEffect(() => {
    if (!id) return;

    const fetchAssignment = async () => {
      setIsLoading(true);
      try {
        const data = await assignmentService.getAssignmentById(id as string);
        setAssignment(data);
        
        // Initialize return quantity if assignment is active
        if (data.status === 'Active') {
          setReturnQuantity(data.quantity - data.returnedQuantity);
        }
      } catch (error) {
        console.error('Error fetching assignment:', error);
        toast.error('Failed to load assignment details');
        router.push('/assignments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [id, router]);
  
  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('status-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        dropdown.classList.add('hidden');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle return assignment
  const openReturnModal = () => {
    if (!assignment) return;
    setReturnQuantity(assignment.quantity - assignment.returnedQuantity);
    setStatusNotes('');
    setShowReturnModal(true);
  };

  const handleReturnAssignment = async () => {
    if (!assignment) return;
    
    setIsProcessing(true);
    try {
      const updatedAssignment = await assignmentService.returnAssignment(
        assignment._id, 
        { 
          returnedQuantity: returnQuantity,
          notes: statusNotes || undefined
        }
      );
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Assignment Returned',
        message: `${returnQuantity} ${updatedAssignment.assetName} returned successfully.`
      });
      
      toast.success('Assignment returned successfully');
      
      // Close modal and refresh assignment data
      setShowReturnModal(false);
      setAssignment(updatedAssignment);
      
    } catch (error) {
      console.error('Error returning assignment:', error);
      toast.error('Failed to return assignment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle status update
  const openStatusModal = (status: string) => {
    setNewStatus(status);
    setStatusNotes('');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!assignment || !newStatus) return;
    
    setIsProcessing(true);
    try {
      const updatedAssignment = await assignmentService.updateAssignmentStatus(
        assignment._id, 
        { 
          status: newStatus,
          notes: statusNotes || undefined
        }
      );
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Assignment Updated',
        message: `Assignment status changed to ${newStatus}.`
      });
      
      toast.success(`Assignment marked as ${newStatus}`);
      
      // Close modal and update assignment data
      setShowStatusModal(false);
      setAssignment(updatedAssignment);
      
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast.error('Failed to update assignment status');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function for status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Returned':
        return 'bg-blue-100 text-blue-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      case 'Damaged':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user has permission to return the assignment
  const canReturnAssignment = () => {
    if (!assignment || !user) return false;
    if (assignment.status !== 'Active') return false;
    
    return (
      user.role === 'Admin' ||
      (user.role === 'BaseCommander' && user.assignedBase === assignment.base) ||
      user.role === 'LogisticsOfficer'
    );
  };
  
  // Check if user can update assignment status
  const canUpdateStatus = () => {
    if (!assignment || !user) return false;
    if (assignment.status !== 'Active') return false;
    
    return user.role === 'Admin' || 
      (user.role === 'BaseCommander' && user.assignedBase === assignment.base);
  };

  if (isLoading) return <LoadingScreen />;

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Assignment not found</h2>
          <p className="mt-2 text-gray-600">The assignment you're looking for doesn't exist</p>
          <Link href="/assignments" className="mt-4 btn btn-primary">
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Assignment Details | Military Asset Management</title>
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
            <h1 className="text-2xl font-semibold text-gray-900">Assignment Details</h1>
            <span
              className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                assignment.status
              )}`}
            >
              {assignment.status}
            </span>
          </div>

          {/* Assignment details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {assignment.assetName} Assignment
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Assigned to {assignment.assignedTo.name} for {assignment.purpose}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Asset</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Link
                      href={`/assets/${assignment.asset}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {assignment.assetName}
                    </Link>
                    <p className="text-xs text-gray-500">{assignment.assetType}</p>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Base</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {assignment.base}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <p>{assignment.assignedTo.name}</p>
                    <p className="text-xs text-gray-500">
                      {assignment.assignedTo.rank} ({assignment.assignedTo.id})
                    </p>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Assigned By</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {assignment.assignedBy.fullName}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {assignment.purpose}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {assignment.quantity}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        assignment.status
                      )}`}
                    >
                      {assignment.status}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(assignment.startDate), 'PPP p')}
                  </dd>
                </div>
                {assignment.endDate && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {format(new Date(assignment.endDate), 'PPP p')}
                    </dd>
                  </div>
                )}
                {assignment.status === 'Returned' && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Returned Quantity</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {assignment.returnedQuantity} of {assignment.quantity}
                    </dd>
                  </div>
                )}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(assignment.createdAt), 'PPP p')}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(assignment.updatedAt), 'PPP p')}
                  </dd>
                </div>
                {assignment.notes && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {assignment.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Action buttons */}
          {(canReturnAssignment() || canUpdateStatus()) && (
            <div className="flex justify-end space-x-4">
              {canReturnAssignment() && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openReturnModal}
                >
                  Return Assets
                </button>
              )}
              
              {canUpdateStatus() && (
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    id="status-menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() => {
                      const menu = document.getElementById('status-dropdown');
                      if (menu) {
                        menu.classList.toggle('hidden');
                      }
                    }}
                  >
                    Change Status
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div
                    id="status-dropdown"
                    className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="status-menu-button"
                    tabIndex={-1}
                  >
                    <div className="py-1" role="none">
                      <button
                        className="text-red-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => {
                          openStatusModal('Lost');
                          const menu = document.getElementById('status-dropdown');
                          if (menu) menu.classList.add('hidden');
                        }}
                      >
                        Mark as Lost
                      </button>
                      <button
                        className="text-orange-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => {
                          openStatusModal('Damaged');
                          const menu = document.getElementById('status-dropdown');
                          if (menu) menu.classList.add('hidden');
                        }}
                      >
                        Mark as Damaged
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Return Assignment Modal */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="Return Assignment"
        size="md"
      >
        <div className="py-4">
          {assignment && (
            <>
              <p className="text-gray-700 mb-4">
                Return {assignment.assetName} assigned to {assignment.assignedTo.name}
              </p>
              
              <div className="mb-4">
                <label htmlFor="returnQuantity" className="block text-sm font-medium text-gray-700">
                  Quantity to Return
                </label>
                <input
                  type="number"
                  id="returnQuantity"
                  className="mt-1 form-input"
                  min="1"
                  max={assignment.quantity - assignment.returnedQuantity}
                  value={returnQuantity}
                  onChange={(e) => setReturnQuantity(parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {assignment.quantity - assignment.returnedQuantity} available to return
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="statusNotes" className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  id="statusNotes"
                  className="mt-1 form-textarea"
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes about the returned items"
                />
              </div>
            </>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowReturnModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleReturnAssignment}
              disabled={isProcessing || returnQuantity < 1 || (assignment && returnQuantity > (assignment.quantity - assignment.returnedQuantity))}
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
                'Return Items'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Mark Assignment as ${newStatus}`}
        size="md"
      >
        <div className="py-4">
          {assignment && (
            <>
              <p className="text-gray-700 mb-4">
                Are you sure you want to mark the assignment of <span className="font-semibold">{assignment.quantity} {assignment.assetName}</span> to <span className="font-semibold">{assignment.assignedTo.name}</span> as <span className="font-semibold">{newStatus}</span>?
              </p>
              
              <div className="mb-4">
                <label htmlFor="statusNotes" className="block text-sm font-medium text-gray-700">
                  Notes (Required)
                </label>
                <textarea
                  id="statusNotes"
                  className="mt-1 form-textarea"
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder={`Please provide details about why the items are ${newStatus.toLowerCase()}`}
                />
              </div>
            </>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowStatusModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleUpdateStatus}
              disabled={isProcessing || !statusNotes.trim()}
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
                `Confirm ${newStatus} Status`
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssignmentDetailPage;