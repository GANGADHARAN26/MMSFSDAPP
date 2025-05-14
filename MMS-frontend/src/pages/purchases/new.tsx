import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Head from 'next/head';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { assetService } from '@/services/assetService';
import { purchaseService } from '@/services/purchaseService';
import { useNotificationStore } from '@/stores/notificationStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import { Asset } from '@/types/asset';

// List of bases
const bases = ['Base Alpha', 'Base Bravo', 'Base Charlie'];

// List of suppliers
const suppliers = [
  'Military Supplies Inc.',
  'Tech Defense Systems',
  'Military Outfitters',
  'Ammo Suppliers Ltd.',
  'Military Vehicles Inc.',
];

// Asset types
const assetTypes = ['Weapon', 'Vehicle', 'Equipment', 'Ammunition'];

const PurchaseSchema = Yup.object().shape({
  assetName: Yup.string().required('Asset name is required'),
  assetType: Yup.string().required('Asset type is required'),
  base: Yup.string().required('Base is required'),
  supplier: Yup.string().required('Supplier is required'),
  quantity: Yup.number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be a whole number'),
  unitCost: Yup.number()
    .required('Unit cost is required')
    .positive('Unit cost must be positive'),
  purchaseDate: Yup.date().required('Purchase date is required'),
  invoiceNumber: Yup.string(),
  notes: Yup.string(),
});

const NewPurchasePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { asset: assetId } = router.query;

  // Check if user has permission to create purchases
  useEffect(() => {
    if (user && user.role !== 'Admin' && user.role !== 'LogisticsOfficer') {
      toast.error('You do not have permission to create purchases');
      router.push('/purchases');
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
        
        if (user?.role === 'LogisticsOfficer' && user.assignedBase) {
          filteredAssets = filteredAssets.filter(asset => asset.base === user.assignedBase);
        }
        
        setAvailableAssets(filteredAssets);
        
        // If assetId is provided in the query, select that asset
        if (assetId) {
          const asset = filteredAssets.find(a => a._id === assetId);
          if (asset) {
            setSelectedAsset(asset);
            formik.setFieldValue('assetName', asset.name);
            formik.setFieldValue('assetType', asset.type);
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

  const formik = useFormik({
    initialValues: {
      assetName: '',
      assetType: '',
      base: user?.role === 'LogisticsOfficer' && user.assignedBase ? user.assignedBase : '',
      supplier: '',
      quantity: 1,
      unitCost: 0,
      purchaseDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      invoiceNumber: '',
      notes: '',
    },
    validationSchema: PurchaseSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // Create the purchase
        const newPurchase = await purchaseService.createPurchase(values);
        
        // Add notification
        addNotification({
          type: 'success',
          title: 'Purchase Created',
          message: `Purchase of ${newPurchase.quantity} ${newPurchase.assetName} has been created.`
        });
        
        toast.success('Purchase created successfully');
        router.push(`/purchases/${newPurchase._id}`);
        
      } catch (error: any) {
        console.error('Error creating purchase:', error);
        toast.error(error.response?.data?.error || 'Failed to create purchase');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Calculate total cost
  const totalCost = formik.values.quantity * formik.values.unitCost;

  // If not admin or logistics officer, don't render the page
  if (user && user.role !== 'Admin' && user.role !== 'LogisticsOfficer') {
    return null;
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>New Purchase | Military Asset Management</title>
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
            <h1 className="text-2xl font-semibold text-gray-900">New Purchase</h1>
          </div>

          {/* Purchase form */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Asset Name */}
                  <div className="sm:col-span-3">
                    <label htmlFor="assetName" className="block text-sm font-medium text-gray-700">
                      Asset Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="assetName"
                        id="assetName"
                        className={`form-input ${
                          formik.touched.assetName && formik.errors.assetName ? 'border-red-500' : ''
                        }`}
                        value={formik.values.assetName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter asset name"
                      />
                      {formik.touched.assetName && formik.errors.assetName && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.assetName}</p>
                      )}
                    </div>
                  </div>

                  {/* Asset Type */}
                  <div className="sm:col-span-3">
                    <label htmlFor="assetType" className="block text-sm font-medium text-gray-700">
                      Asset Type
                    </label>
                    <div className="mt-1">
                      <select
                        id="assetType"
                        name="assetType"
                        className={`form-select ${
                          formik.touched.assetType && formik.errors.assetType ? 'border-red-500' : ''
                        }`}
                        value={formik.values.assetType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <option value="">Select asset type</option>
                        {assetTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {formik.touched.assetType && formik.errors.assetType && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.assetType}</p>
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
                        disabled={user?.role === 'LogisticsOfficer' && !!user.assignedBase}
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

                  {/* Supplier */}
                  <div className="sm:col-span-3">
                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
                      Supplier
                    </label>
                    <div className="mt-1">
                      <select
                        id="supplier"
                        name="supplier"
                        className={`form-select ${
                          formik.touched.supplier && formik.errors.supplier ? 'border-red-500' : ''
                        }`}
                        value={formik.values.supplier}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <option value="">Select a supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier} value={supplier}>
                            {supplier}
                          </option>
                        ))}
                      </select>
                      {formik.touched.supplier && formik.errors.supplier && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.supplier}</p>
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

                  {/* Unit Cost */}
                  <div className="sm:col-span-3">
                    <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700">
                      Unit Cost ($)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="unitCost"
                        id="unitCost"
                        min="0.01"
                        step="0.01"
                        className={`form-input ${
                          formik.touched.unitCost && formik.errors.unitCost ? 'border-red-500' : ''
                        }`}
                        value={formik.values.unitCost}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.unitCost && formik.errors.unitCost && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.unitCost}</p>
                      )}
                    </div>
                  </div>

                  {/* Total Cost (calculated) */}
                  <div className="sm:col-span-3">
                    <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700">
                      Total Cost ($)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="totalCost"
                        className="form-input bg-gray-100"
                        value={totalCost.toLocaleString()}
                        disabled
                      />
                    </div>
                  </div>

                  {/* Purchase Date */}
                  <div className="sm:col-span-3">
                    <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
                      Purchase Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="purchaseDate"
                        id="purchaseDate"
                        className={`form-input ${
                          formik.touched.purchaseDate && formik.errors.purchaseDate ? 'border-red-500' : ''
                        }`}
                        value={formik.values.purchaseDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.purchaseDate && formik.errors.purchaseDate && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.purchaseDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Invoice Number */}
                  <div className="sm:col-span-3">
                    <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">
                      Invoice Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="invoiceNumber"
                        id="invoiceNumber"
                        className={`form-input ${
                          formik.touched.invoiceNumber && formik.errors.invoiceNumber ? 'border-red-500' : ''
                        }`}
                        value={formik.values.invoiceNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Optional invoice number"
                      />
                      {formik.touched.invoiceNumber && formik.errors.invoiceNumber && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.invoiceNumber}</p>
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
                        placeholder="Optional notes about this purchase"
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
                      'Create Purchase'
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

export default NewPurchasePage;