import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Head from 'next/head';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { assetService } from '@/services/assetService';
import { transferService } from '@/services/transferService';
import { useNotificationStore } from '@/stores/notificationStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import { Asset } from '@/types/asset';

// List of bases
const bases = ['Base Alpha', 'Base Bravo', 'Base Charlie'];

const TransferSchema = Yup.object().shape({
  asset: Yup.string().required('Asset is required'),
  fromBase: Yup.string().required('From Base is required'),
  toBase: Yup.string()
    .required('To Base is required')
    .notOneOf([Yup.ref('fromBase')], 'To Base must be different from From Base'),
  quantity: Yup.number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be a whole number'),
  notes: Yup.string(),
});

const NewTransferPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { asset: assetId } = router.query;

  // Check if user has permission to create transfers
  useEffect(() => {
    if (user && user.role !== 'Admin' && user.role !== 'LogisticsOfficer') {
      toast.error('You do not have permission to create transfers');
      router.push('/transfers');
    }
  }, [user, router]);

  // Fetch available assets
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would have an API endpoint to get assets with available quantity
        // For now, we'll use the getAssets endpoint and filter client-side
        const response = await assetService.getAssets({
          limit: 100, // Get a large number of assets to filter
        });
        
        // Filter assets based on user role and assigned base
        let filteredAssets = response.assets;
        
        if (user?.role === 'LogisticsOfficer' && user.assignedBase) {
          filteredAssets = filteredAssets.filter(asset => asset.base === user.assignedBase);
        }
        
        // Only show assets with available quantity
        filteredAssets = filteredAssets.filter(asset => asset.available > 0);
        
        setAvailableAssets(filteredAssets);
        
        // If assetId is provided in the query, select that asset
        if (assetId) {
          const asset = filteredAssets.find(a => a._id === assetId);
          if (asset) {
            setSelectedAsset(asset);
            formik.setFieldValue('asset', asset._id);
            formik.setFieldValue('fromBase', asset.base);
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

  const formik = useFormik({
    initialValues: {
      asset: assetId || '',
      fromBase: user?.role === 'LogisticsOfficer' && user.assignedBase ? user.assignedBase : '',
      toBase: '',
      quantity: 1,
      notes: '',
    },
    validationSchema: TransferSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // Check if quantity is valid
        if (selectedAsset && values.quantity > selectedAsset.available) {
          toast.error(`Cannot transfer more than available quantity (${selectedAsset.available})`);
          setIsSubmitting(false);
          return;
        }
        
        // Create the transfer
        const newTransfer = await transferService.createTransfer(values);
        
        // Add notification
        addNotification({
          type: 'success',
          title: 'Transfer Created',
          message: `Transfer of ${newTransfer.quantity} ${newTransfer.assetName} has been created and is pending approval.`
        });
        
        toast.success('Transfer created successfully');
        router.push(`/transfers/${newTransfer._id}`);
        
      } catch (error: any) {
        console.error('Error creating transfer:', error);
        toast.error(error.response?.data?.error || 'Failed to create transfer');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Update selected asset when asset changes
  useEffect(() => {
    const asset = availableAssets.find(a => a._id === formik.values.asset);
    setSelectedAsset(asset || null);
    
    // If asset changes, update fromBase
    if (asset) {
      formik.setFieldValue('fromBase', asset.base);
    }
  }, [formik.values.asset, availableAssets]);

  // If not admin or logistics officer, don't render the page
  if (user && user.role !== 'Admin' && user.role !== 'LogisticsOfficer') {
    return null;
  }

  if (isLoading && !availableAssets.length) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>New Transfer | Military Asset Management</title>
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
            <h1 className="text-2xl font-semibold text-gray-900">New Transfer</h1>
          </div>

          {/* Transfer form */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {availableAssets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No assets available for transfer.</p>
                  <p className="text-gray-500 mt-2">
                    Assets must have available quantity to be transferred.
                  </p>
                </div>
              ) : (
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
                              {asset.name} ({asset.type}) - Available: {asset.available}
                            </option>
                          ))}
                        </select>
                        {formik.touched.asset && formik.errors.asset && (
                          <p className="mt-2 text-sm text-red-600">{formik.errors.asset}</p>
                        )}
                      </div>
                    </div>

                    {/* From Base */}
                    <div className="sm:col-span-3">
                      <label htmlFor="fromBase" className="block text-sm font-medium text-gray-700">
                        From Base
                      </label>
                      <div className="mt-1">
                        <select
                          id="fromBase"
                          name="fromBase"
                          className={`form-select ${
                            formik.touched.fromBase && formik.errors.fromBase ? 'border-red-500' : ''
                          }`}
                          value={formik.values.fromBase}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={user?.role === 'LogisticsOfficer' && !!user.assignedBase || !!selectedAsset}
                        >
                          <option value="">Select a base</option>
                          {bases.map((base) => (
                            <option key={base} value={base}>
                              {base}
                            </option>
                          ))}
                        </select>
                        {formik.touched.fromBase && formik.errors.fromBase && (
                          <p className="mt-2 text-sm text-red-600">{formik.errors.fromBase}</p>
                        )}
                      </div>
                    </div>

                    {/* To Base */}
                    <div className="sm:col-span-3">
                      <label htmlFor="toBase" className="block text-sm font-medium text-gray-700">
                        To Base
                      </label>
                      <div className="mt-1">
                        <select
                          id="toBase"
                          name="toBase"
                          className={`form-select ${
                            formik.touched.toBase && formik.errors.toBase ? 'border-red-500' : ''
                          }`}
                          value={formik.values.toBase}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="">Select a base</option>
                          {bases
                            .filter((base) => base !== formik.values.fromBase)
                            .map((base) => (
                              <option key={base} value={base}>
                                {base}
                              </option>
                            ))}
                        </select>
                        {formik.touched.toBase && formik.errors.toBase && (
                          <p className="mt-2 text-sm text-red-600">{formik.errors.toBase}</p>
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
                          max={selectedAsset?.available || 1}
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
                        {selectedAsset && (
                          <p className="mt-2 text-sm text-gray-500">
                            Available: {selectedAsset.available}
                          </p>
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
                          placeholder="Optional notes about this transfer"
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
                        'Create Transfer'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewTransferPage;