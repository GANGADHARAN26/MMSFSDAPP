import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Head from 'next/head';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { assetService } from '@/services/assetService';
import { expenditureService } from '@/services/expenditureService';
import { useNotificationStore } from '@/stores/notificationStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import { Asset } from '@/types/asset';

// List of bases
const bases = ['Base Alpha', 'Base Bravo', 'Base Charlie'];

// List of reasons
const reasons = ['Training', 'Operation', 'Maintenance', 'Damaged', 'Lost', 'Other'];

// Define a specific type for expenditure reasons
export type ExpenditureReason = 'Training' | 'Operation' | 'Maintenance' | 'Damaged' | 'Lost' | 'Other';

// Asset types
const assetTypes = ['Weapon', 'Vehicle', 'Equipment', 'Ammunition'];

interface ExpenditureFormValues {
  asset: string;
  base: string;
  quantity: number;
  reason: ExpenditureReason | ''; // Use ExpenditureReason, allow empty for initial state
  expendedBy: { name: string; rank: string; id: string; };
  expenditureDate: string;
  operationName?: string;
  location?: string;
  notes?: string;
}

const ExpenditureSchema = Yup.object().shape({
  asset: Yup.string().required('Asset is required'),
  base: Yup.string().required('Base is required'),
  quantity: Yup.number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be a whole number'),
  reason: Yup.string().oneOf([...reasons]).required('Reason is required'),
  expendedBy: Yup.object().shape({
    name: Yup.string().required('Name is required'),
    rank: Yup.string().required('Rank is required'),
    id: Yup.string().required('ID is required'),
  }),
  expenditureDate: Yup.date().required('Expenditure date is required'),
  operationName: Yup.string().when('reason', {
    is: (reason: string) => reason === 'Operation' || reason === 'Training',
    then: (schema) => schema.required('Operation/Training name is required'),
    otherwise: (schema) => schema,
  }),
  location: Yup.string(),
  notes: Yup.string(),
});

const NewExpenditurePage = () => {
  const router = useRouter();
  const { user } = useAuth();
    const { asset: assetIdFromQuery } = router.query; // Assuming asset ID can be passed via query

  const addNotification = useNotificationStore((state) => state.addNotification);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { asset: assetId } = router.query;

  // Check if user has permission to create expenditures
  useEffect(() => {
    if (user && user.role !== 'Admin' && user.role !== 'BaseCommander' && user.role !== 'LogisticsOfficer') {
      toast.error('You do not have permission to create expenditures');
      router.push('/expenditures');
    }
  }, [user, router]);

  // Fetch assets for reference
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const response = await assetService.getAssets({
          limit: 100, // Get a large number of assets
        });
        
        // Filter assets based on user role and assigned base
        let filteredAssets = response.assets;
        
        if (user?.role === 'BaseCommander' && user.assignedBase) {
          filteredAssets = filteredAssets.filter(asset => asset.base === user.assignedBase);
        }
        
        setAvailableAssets(filteredAssets);
        
        // If assetId is provided in the query, select that asset
        if (assetId) {
          const asset = filteredAssets.find(a => a._id === assetId);
          if (asset) {
            setSelectedAsset(asset);
            formik.setFieldValue('asset', asset._id);
            formik.setFieldValue('base', asset.base);
          }
        }
        
      } catch (error) {
        console.error('Error fetching assets:', error);
        toast.error('Failed to load assets');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchAssets();
    }
  }, [assetId, user]);

  const formik = useFormik<ExpenditureFormValues>({
    initialValues: {
      asset: (Array.isArray(assetIdFromQuery) ? assetIdFromQuery[0] : assetIdFromQuery) || '',
      base: user?.role === 'BaseCommander' && user.assignedBase ? user.assignedBase : '',
      quantity: 1,
      reason: '',
      expendedBy: {
        name: '',
        rank: '',
        id: '',
      },
      expenditureDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      operationName: '',
      location: '',
      notes: '',
    },
    validationSchema: ExpenditureSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // Prepare payload, ensuring reason is ExpenditureReason or undefined
        const expenditurePayload = {
          ...values,
          reason: values.reason === '' ? undefined : values.reason,
        };
        // Create the expenditure
        const newExpenditure = await expenditureService.createExpenditure(expenditurePayload);
        
        // Add notification
        addNotification({
          type: 'success',
          title: 'Expenditure Created',
          message: `Expenditure of ${newExpenditure.quantity} ${newExpenditure.assetName} has been recorded.`
        });
        
        toast.success('Expenditure created successfully');
        router.push(`/expenditures/${newExpenditure._id}`);
        
      } catch (error: any) {
        console.error('Error creating expenditure:', error);
        toast.error(error.response?.data?.error || 'Failed to create expenditure');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Update selected asset when asset changes
  useEffect(() => {
    const asset = availableAssets.find(a => a._id === formik.values.asset);
    setSelectedAsset(asset || null);
    
    // If asset changes, update base
    if (asset) {
      formik.setFieldValue('base', asset.base);
    }
  }, [formik.values.asset, availableAssets]);

  // If not authorized, don't render the page
  if (user && user.role !== 'Admin' && user.role !== 'BaseCommander' && user.role !== 'LogisticsOfficer') {
    return null;
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>New Expenditure | Military Asset Management</title>
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
            <h1 className="text-2xl font-semibold text-gray-900">New Expenditure</h1>
          </div>

          {/* Expenditure form */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Asset selection */}
                  <div className="sm:col-span-3">
                    <label htmlFor="asset" className="block text-sm font-medium text-gray-700">
                      Asset
                    </label>
                    <div className="mt-1">
                      <select
                        id="asset"
                        name="asset"
                        className={`form-select ${
                          formik.touched.asset && formik.errors.asset ? 'border-red-500' : ''
                        }`}
                        value={formik.values.asset}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={!!assetId}
                      >
                        <option value="">Select an asset</option>
                        {availableAssets.map((asset) => (
                          <option key={asset._id} value={asset._id}>
                            {asset.name} ({asset.type})
                          </option>
                        ))}
                      </select>
                      {formik.touched.asset && formik.errors.asset && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.asset}</p>
                      )}
                    </div>
                  </div>

                  {/* Base */}
                  <div className="sm:col-span-3">
                    <label htmlFor="base" className="block text-sm font-medium text-gray-700">
                      Base
                    </label>
                    <div className="mt-1">
                      <select
                        id="base"
                        name="base"
                        className={`form-select ${
                          formik.touched.base && formik.errors.base ? 'border-red-500' : ''
                        }`}
                        value={formik.values.base}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={user?.role === 'BaseCommander' || !!selectedAsset}
                      >
                        <option value="">Select a base</option>
                        {bases.map((base) => (
                          <option key={base} value={base}>
                            {base}
                          </option>
                        ))}
                      </select>
                      {formik.touched.base && formik.errors.base && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.base}</p>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-3">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="quantity"
                        id="quantity"
                        min="1"
                        className={`form-input ${
                          formik.touched.quantity && formik.errors.quantity ? 'border-red-500' : ''
                        }`}
                        value={formik.values.quantity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.quantity && formik.errors.quantity && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.quantity}</p>
                      )}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="sm:col-span-3">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                      Reason
                    </label>
                    <div className="mt-1">
                      <select
                        id="reason"
                        name="reason"
                        className={`form-select ${
                          formik.touched.reason && formik.errors.reason ? 'border-red-500' : ''
                        }`}
                        value={formik.values.reason}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <option value="">Select a reason</option>
                        {reasons.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                      {formik.touched.reason && formik.errors.reason && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.reason}</p>
                      )}
                    </div>
                  </div>

                  {/* Expended By - Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="expendedBy.name" className="block text-sm font-medium text-gray-700">
                      Expended By (Name)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="expendedBy.name"
                        id="expendedBy.name"
                        className={`form-input ${
                          formik.touched.expendedBy?.name && formik.errors.expendedBy?.name ? 'border-red-500' : ''
                        }`}
                        value={formik.values.expendedBy.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.expendedBy?.name && formik.errors.expendedBy?.name && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.expendedBy.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Expended By - Rank */}
                  <div className="sm:col-span-2">
                    <label htmlFor="expendedBy.rank" className="block text-sm font-medium text-gray-700">
                      Expended By (Rank)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="expendedBy.rank"
                        id="expendedBy.rank"
                        className={`form-input ${
                          formik.touched.expendedBy?.rank && formik.errors.expendedBy?.rank ? 'border-red-500' : ''
                        }`}
                        value={formik.values.expendedBy.rank}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.expendedBy?.rank && formik.errors.expendedBy?.rank && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.expendedBy.rank}</p>
                      )}
                    </div>
                  </div>

                  {/* Expended By - ID */}
                  <div className="sm:col-span-2">
                    <label htmlFor="expendedBy.id" className="block text-sm font-medium text-gray-700">
                      Expended By (ID)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="expendedBy.id"
                        id="expendedBy.id"
                        className={`form-input ${
                          formik.touched.expendedBy?.id && formik.errors.expendedBy?.id ? 'border-red-500' : ''
                        }`}
                        value={formik.values.expendedBy.id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.expendedBy?.id && formik.errors.expendedBy?.id && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.expendedBy.id}</p>
                      )}
                    </div>
                  </div>

                  {/* Expenditure Date */}
                  <div className="sm:col-span-3">
                    <label htmlFor="expenditureDate" className="block text-sm font-medium text-gray-700">
                      Expenditure Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="expenditureDate"
                        id="expenditureDate"
                        className={`form-input ${
                          formik.touched.expenditureDate && formik.errors.expenditureDate ? 'border-red-500' : ''
                        }`}
                        value={formik.values.expenditureDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.expenditureDate && formik.errors.expenditureDate && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.expenditureDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Operation Name (conditional) */}
                  {(formik.values.reason === 'Operation' || formik.values.reason === 'Training') && (
                    <div className="sm:col-span-3">
                      <label htmlFor="operationName" className="block text-sm font-medium text-gray-700">
                        {formik.values.reason === 'Operation' ? 'Operation Name' : 'Training Name'}
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="operationName"
                          id="operationName"
                          className={`form-input ${
                            formik.touched.operationName && formik.errors.operationName ? 'border-red-500' : ''
                          }`}
                          value={formik.values.operationName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder={`Enter ${formik.values.reason.toLowerCase()} name`}
                        />
                        {formik.touched.operationName && formik.errors.operationName && (
                          <p className="mt-2 text-sm text-red-600">{formik.errors.operationName}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="sm:col-span-3">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="location"
                        id="location"
                        className={`form-input ${
                          formik.touched.location && formik.errors.location ? 'border-red-500' : ''
                        }`}
                        value={formik.values.location}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Optional location"
                      />
                      {formik.touched.location && formik.errors.location && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.location}</p>
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
                        placeholder="Optional notes about this expenditure"
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
                    disabled={isSubmitting || !formik.isValid}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      'Create Expenditure'
                    )}
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

export default NewExpenditurePage;