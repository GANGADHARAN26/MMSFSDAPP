import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import toast from 'react-hot-toast';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        
        // Call the login function which will make a request to /auth/login
        const loggedInUser = await login(values.username, values.password);
        
        // Check if token was stored in localStorage
        const token = localStorage.getItem('token');
        if (token) {
          toast.success('Login successful');
          
          // Redirect based on user role
          if (loggedInUser.role === 'Admin') {
            router.replace('/dashboard');
          } else {
            router.replace('/assets');
          }
        } else {
          // This should not happen if login was successful, but just in case
          toast.error('Authentication failed. Please try again.');
        }
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Handle API error response
        if (error.response) {
          // Extract error message from the API response
          const errorMessage = error.response.data?.error || 
                              error.response.data?.message || 
                              'Invalid username or password';
          toast.error(errorMessage);
        } else if (error.request) {
          // The request was made but no response was received
          toast.error('No response from server. Please try again later.');
        } else {
          // Something happened in setting up the request
          toast.error(error.message || 'Login failed');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <>
      <Head>
        <title>Login | Military Asset Management</title>
      </Head>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Military Asset Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="form-input"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.username && formik.errors.username && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.username}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="form-input"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.password}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;