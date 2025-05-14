import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Head from 'next/head';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import { Assignment } from '@/types/assignment';
import Link from 'next/link';
import { format } from 'date-fns';
// Mock data for assignments
const mockAssignments: { [key: string]: Assignment } = {
  '1': {
    _id: '1',
    asset: '1',
    assetName: 'M4 Carbine',
    assetType: 'Weapon',
    base: 'Base Alpha',
    quantity: 10,
    assignedTo: {
      name: 'John Smith',
      rank: 'Sergeant',
      id: 'SGT-001',
    },
    assignedBy: {
      _id: '1',
      username: 'admin',
      fullName: 'Admin User',
    },
    purpose: 'Training Exercise',
    startDate: '2023-08-01T08:00:00Z',
    endDate: '2023-08-15T17:00:00Z',
    status: 'Active',
    returnedQuantity: 0,
    createdAt: '2023-07-30T10:15:00Z',
    updatedAt: '2023-07-30T10:15:00Z',
  },
  '2': {
    _id: '2',
    asset: '4',
    assetName: 'Night Vision Goggles',
    assetType: 'Equipment',
    base: 'Base Bravo',
    quantity: 5,
    assignedTo: {
      name: 'Jane Doe',
      rank: 'Lieutenant',
      id: 'LT-002',
    },
    assignedBy: {
      _id: '2',
      username: 'basecommander',
      fullName: 'Base Commander',
    },
    purpose: 'Night Operation',
    startDate: '2023-08-05T19:00:00Z',
    endDate: '2023-08-06T06:00:00Z',
    status: 'Returned',
    returnedQuantity: 5,
    notes: 'All equipment returned in good condition',
    createdAt: '2023-08-04T14:30:00Z',
    updatedAt: '2023-08-06T07:15:00Z',
  },
  '3': {
    _id: '3',
    asset: '2',
    assetName: 'Humvee',
    assetType: 'Vehicle',
    base: 'Base Alpha',
    quantity: 2,
    assignedTo: {
      name: 'Robert Johnson',
      rank: 'Captain',
      id: 'CPT-003',
    },
    assignedBy: {
      _id: '1',
      username: 'admin',
      fullName: 'Admin User',
    },
    purpose: 'Patrol Mission',
    startDate: '2023-08-10T06:00:00Z',
    status: 'Active',
    returnedQuantity: 0,
    createdAt: '2023-08-09T16:45:00Z',
    updatedAt: '2023-08-09T16:45:00Z',
  },
  '4': {
    _id: '4',
    asset: '5',
    assetName: 'Combat Boots',
    assetType: 'Equipment',
    base: 'Base Bravo',
    quantity: 50,
    assignedTo: {
      name: 'Michael Williams',
      rank: 'Sergeant Major',
      id: 'SGM-004',
    },
    assignedBy: {
      _id: '2',
      username: 'basecommander',
      fullName: 'Base Commander',
    },
    purpose: 'New Recruits Equipment',
    startDate: '2023-07-15T08:00:00Z',
    status: 'Active',
    returnedQuantity: 0,
    createdAt: '2023-07-14T11:30:00Z',
    updatedAt: '2023-07-14T11:30:00Z',
  },
  '5': {
    _id: '5',
    asset: '1',
    assetName: 'M4 Carbine',
    assetType: 'Weapon',
    base: 'Base Alpha',
    quantity: 5,
    assignedTo: {
      name: 'David Brown',
      rank: 'Corporal',
      id: 'CPL-005',
    },
    assignedBy: {
      _id: '1',
      username: 'admin',
      fullName: 'Admin User',
    },
    purpose: 'Security Detail',
    startDate: '2023-08-03T07:00:00Z',
    endDate: '2023-08-10T19:00:00Z',
    status: 'Returned',
    returnedQuantity: 4,
    notes: 'One weapon damaged during operation',
    createdAt: '2023-08-02T15:20:00Z',
    updatedAt: '2023-08-10T19:45:00Z',
  }
};

const ReturnSchema = Yup.object().shape({
  returnedQuantity: Yup.number()
    .required('Returned quantity is required')
    .min(1, 'Must return at least 1 item')
    .integer('Must be a whole number'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['Returned', 'Lost', 'Damaged'], 'Invalid status'),
  notes: Yup.string(),
});

const ReturnAssignmentPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    if (!id) return;

    // Simulate API call
    setIsLoading(true);

    setTimeout(() => {
      const assignmentData = mockAssignments[id as string];
      if (assignmentData) {
        if (assignmentData.status !== 'Active') {
          toast.error('This assignment is not active and cannot be returned');
          router.push(`/assignments/${id}`);
          return;
        }
        setAssignment(assignmentData);
        formik.setFieldValue('returnedQuantity', assignmentData.quantity);
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

  const formik = useFormik({
    initialValues: {
      returnedQuantity: 0,
      status: 'Returned',
      notes: '',
    },
    validationSchema: ReturnSchema,
    onSubmit: async (values) => {
      try {
        if (!assignment) return;

        // Validate returned quantity
        if (values.returnedQuantity > assignment.quantity) {
          toast.error(`Cannot return more than the assigned quantity (${assignment.quantity})`);
          return;
        }

        // Simulate API call
        setIsLoading(true);
        
        // In production, this would call the API
        setTimeout(() => {
          toast.success('Assignment returned successfully');
          router.push(`/assignments/${id}`);
        }, 1000);
      } catch (error: any) {
        toast.error(error.message || 'Failed to return assignment');
        setIsLoading(false);
      }
    },
  });

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

  if (!canReturnAssignment()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Permission Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to return this assignment</p>
          <button
            onClick={() => router.back()}
            className="mt-4 btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Return Assignment | Military Asset Management</title>
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
            <h1 className="text-2xl font-semibold text-gray-900">Return Assignment</h1>
          </div>

          {/* Assignment summary */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {assignment.assetName} Assignment
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Assigned to {assignment.assignedTo.name} for {assignment.purpose}
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Asset</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {assignment.assetName} ({assignment.assetType})
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Base</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assignment.base}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {assignment.assignedTo.name} ({assignment.assignedTo.rank})
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assignment.quantity}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(assignment.startDate), 'PPP')}
                  </dd>
                </div>
                {assignment.endDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {format(new Date(assignment.endDate), 'PPP')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Return form */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Returned Quantity */}
                  <div className="sm:col-span-3">
                    <label htmlFor="returnedQuantity" className="block text-sm font-medium text-gray-700">
                      Returned Quantity
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="returnedQuantity"
                        id="returnedQuantity"
                        min="0"
                        max={assignment.quantity}
                        className={`form-input ${
                          formik.touched.returnedQuantity && formik.errors.returnedQuantity ? 'border-red-500' : ''
                        }`}
                        value={formik.values.returnedQuantity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.returnedQuantity && formik.errors.returnedQuantity && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.returnedQuantity}</p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Maximum: {assignment.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="sm:col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1">
                      <select
                        id="status"
                        name="status"
                        className={`form-select ${
                          formik.touched.status && formik.errors.status ? 'border-red-500' : ''
                        }`}
                        value={formik.values.status}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <option value="Returned">Returned</option>
                        <option value="Lost">Lost</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                      {formik.touched.status && formik.errors.status && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.status}</p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        className={`form-textarea ${
                          formik.touched.notes && formik.errors.notes ? 'border-red-500' : ''
                        }`}
                        value={formik.values.notes}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Add any notes about the condition of the returned items"
                      />
                      {formik.touched.notes && formik.errors.notes && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.notes}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading || !formik.isValid || formik.isSubmitting}
                  >
                    {isLoading ? 'Processing...' : 'Complete Return'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReturnAssignmentPage;