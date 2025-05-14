import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import LoadingScreen from '@/components/ui/LoadingScreen';

const PasswordChangeSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const ProfilePage = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: PasswordChangeSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsLoading(true);
        const response = await authService.changePassword(values.currentPassword, values.newPassword);
        toast.success(response.message || 'Password changed successfully');
        resetForm();
      } catch (error: any) {
        console.error('Password change error:', error);
        
        // Handle API error response
        if (error.response) {
          const errorMessage = error.response.data?.error || 
                              error.response.data?.message || 
                              'Failed to change password';
          toast.error(errorMessage);
        } else if (error.request) {
          // The request was made but no response was received
          toast.error('No response from server. Please try again later.');
        } else {
          // Something happened in setting up the request
          toast.error(error.message || 'Failed to change password');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!isInitialized) return <LoadingScreen />;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Not Authenticated</h2>
          <p className="mt-2 text-gray-600">Please log in to view your profile</p>
          <Link href="/login" className="mt-4 btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profile | Military Asset Management</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Profile</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('profile')}
              >
                Profile Information
              </button>
              <button
                className={`${
                  activeTab === 'password'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('password')}
              >
                Change Password
              </button>
            </nav>
          </div>

          {/* Profile Information */}
          {activeTab === 'profile' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Personal details and application access
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.fullName}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Username</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.username}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.email}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.role === 'Admin' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      )}
                      {user.role === 'BaseCommander' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Base Commander
                        </span>
                      )}
                      {user.role === 'LogisticsOfficer' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Logistics Officer
                        </span>
                      )}
                    </dd>
                  </div>
                  {user.assignedBase && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Assigned Base</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user.assignedBase}
                      </dd>
                    </div>
                  )}
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Change Password */}
          {activeTab === 'password' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Change Password
                </h3>
                <form onSubmit={passwordFormik.handleSubmit}>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          className={`form-input ${
                            passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword
                              ? 'border-red-500'
                              : ''
                          }`}
                          value={passwordFormik.values.currentPassword}
                          onChange={passwordFormik.handleChange}
                          onBlur={passwordFormik.handleBlur}
                        />
                        {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                          <p className="mt-2 text-sm text-red-600">{passwordFormik.errors.currentPassword}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          className={`form-input ${
                            passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                              ? 'border-red-500'
                              : ''
                          }`}
                          value={passwordFormik.values.newPassword}
                          onChange={passwordFormik.handleChange}
                          onBlur={passwordFormik.handleBlur}
                        />
                        {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                          <p className="mt-2 text-sm text-red-600">{passwordFormik.errors.newPassword}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className={`form-input ${
                            passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword
                              ? 'border-red-500'
                              : ''
                          }`}
                          value={passwordFormik.values.confirmPassword}
                          onChange={passwordFormik.handleChange}
                          onBlur={passwordFormik.handleBlur}
                        />
                        {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                          <p className="mt-2 text-sm text-red-600">{passwordFormik.errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading || !passwordFormik.isValid || passwordFormik.isSubmitting}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;