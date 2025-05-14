import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { expenditureService } from '@/services/expenditureService';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Expenditure } from '@/types/expenditure';
import toast from 'react-hot-toast';

const ExpenditureDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [expenditure, setExpenditure] = useState<Expenditure | null>(null);

  // Fetch expenditure details
  useEffect(() => {
    if (!id) return;

    const fetchExpenditure = async () => {
      setIsLoading(true);
      try {
        const data = await expenditureService.getExpenditureById(id as string);
        setExpenditure(data);
      } catch (error) {
        console.error('Error fetching expenditure:', error);
        toast.error('Failed to load expenditure details');
        router.push('/expenditures');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenditure();
  }, [id, router]);

  // Get reason badge class
  const getReasonBadgeClass = (reason: string) => {
    switch (reason) {
      case 'Training':
        return 'bg-blue-100 text-blue-800';
      case 'Operation':
        return 'bg-purple-100 text-purple-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Damaged':
        return 'bg-orange-100 text-orange-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user can generate report
  const canGenerateReport = () => {
    if (!expenditure || !user) return false;
    
    return user.role === 'Admin' || 
      (user.role === 'BaseCommander' && user.assignedBase === expenditure.base) ||
      user.role === 'LogisticsOfficer';
  };

  if (isLoading) return <LoadingScreen />;

  if (!expenditure) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Expenditure not found</h2>
          <p className="mt-2 text-gray-600">The expenditure you're looking for doesn't exist</p>
          <Link href="/expenditures" className="mt-4 btn btn-primary">
            Back to Expenditures
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Expenditure Details | Military Asset Management</title>
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
            <h1 className="text-2xl font-semibold text-gray-900">Expenditure Details</h1>
            <span
              className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonBadgeClass(
                expenditure.reason
              )}`}
            >
              {expenditure.reason}
            </span>
          </div>

          {/* Expenditure details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {expenditure.assetName} Expenditure
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {expenditure.quantity} units expended for {expenditure.reason.toLowerCase()}
                {expenditure.operationName && ` - ${expenditure.operationName}`}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Asset</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Link
                      href={`/assets/${expenditure.asset}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {expenditure.assetName}
                    </Link>
                    <p className="text-xs text-gray-500">{expenditure.assetType}</p>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Base</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {expenditure.base}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {expenditure.quantity}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Reason</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonBadgeClass(
                        expenditure.reason
                      )}`}
                    >
                      {expenditure.reason}
                    </span>
                  </dd>
                </div>
                {expenditure.operationName && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Operation</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {expenditure.operationName}
                    </dd>
                  </div>
                )}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Expended By</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <p>{expenditure.expendedBy.name}</p>
                    <p className="text-xs text-gray-500">
                      {expenditure.expendedBy.rank} ({expenditure.expendedBy.id})
                    </p>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Authorized By</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {expenditure.authorizedBy.fullName}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Expenditure Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(expenditure.expenditureDate), 'PPP p')}
                  </dd>
                </div>
                {expenditure.location && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {expenditure.location}
                    </dd>
                  </div>
                )}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(expenditure.createdAt), 'PPP p')}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(expenditure.updatedAt), 'PPP p')}
                  </dd>
                </div>
                {expenditure.notes && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {expenditure.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/expenditures" className="btn btn-secondary">
              Back to Expenditures
            </Link>
            {canGenerateReport() && (
              <Link href={`/reports/expenditure/${expenditure._id}`} className="btn btn-primary">
                Generate Report
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpenditureDetailPage;