import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import UserForm from '@/components/users/UserForm';
import UserEditForm from '@/components/users/UserEditForm';
import { User } from '@/types/user';
import { userService, CreateUserData } from '@/services/userService';
import { useNotificationStore } from '@/stores/notificationStore';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  // State for users list and pagination
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for sorting and filtering
  const [filters, setFilters] = useState({
    role: '',
    base: '',
    active: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has admin access
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      toast.error('You do not have permission to access this page');
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch users from API
  const fetchUsers = async () => {
    if (!user || user.role !== 'Admin') return;
    
    setIsLoading(true);
    try {
      const params: any = {
        sortBy,
        sortOrder,
        limit,
        skip: (page - 1) * limit
      };
      
      // Add filters to params if they exist
      if (filters.role) params.role = filters.role;
      if (filters.base) params.base = filters.base;
      if (filters.active !== '') params.active = filters.active === 'true';
      if (filters.search) params.search = filters.search;
      
      const response = await userService.getUsers(params);
      setUsers(response);
      
      // For now, we'll just use the length of the response as the total
      // In a real API, this would come from a count endpoint or header
      setTotalUsers(response.length);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [user, page, limit, sortBy, sortOrder, filters]);

  // Handle creating a new user
  const handleCreateUser = async (userData: CreateUserData) => {
    setIsSubmitting(true);
    try {
      const newUser = await userService.createUser(userData);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'User Created',
        message: `User ${newUser.fullName} has been created successfully.`
      });
      
      toast.success('User created successfully');
      
      // Close modal and refresh user list
      setShowCreateModal(false);
      fetchUsers();
      
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating a user
  const handleUpdateUser = async (
    id: string, 
    userData: {
      fullName?: string;
      email?: string;
      role?: string;
      assignedBase?: string;
      active?: boolean;
    }
  ) => {
    setIsSubmitting(true);
    try {
      const updatedUser = await userService.updateUser(id, userData);
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'User Updated',
        message: `User ${updatedUser.fullName} has been updated successfully.`
      });
      
      toast.success('User updated successfully');
      
      // Close modal and refresh user list
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
      
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggling user active status (deactivate/activate)
  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      await userService.updateUser(userId, { active: !currentActive });
      
      // Add notification
      addNotification({
        type: 'success',
        title: currentActive ? 'User Deactivated' : 'User Activated',
        message: `User has been ${currentActive ? 'deactivated' : 'activated'} successfully.`
      });
      
      toast.success(`User ${currentActive ? 'deactivated' : 'activated'} successfully`);
      
      // Update the local state to reflect the change
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, active: !currentActive } : user
        )
      );
      
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(`Failed to ${currentActive ? 'deactivate' : 'activate'} user`);
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  // Open edit modal with selected user
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  if (isLoading) return <LoadingScreen />;

  // If not admin, don't render the page
  if (user && user.role !== 'Admin') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Users | Military Asset Management</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
            <div className="flex space-x-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New User
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 bg-white p-4 shadow rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="mt-1 form-select"
                    value={filters.role}
                    onChange={(e) => handleFilterChange({ ...filters, role: e.target.value })}
                  >
                    <option value="">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="BaseCommander">Base Commander</option>
                    <option value="LogisticsOfficer">Logistics Officer</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="base" className="block text-sm font-medium text-gray-700">
                    Base
                  </label>
                  <select
                    id="base"
                    name="base"
                    className="mt-1 form-select"
                    value={filters.base}
                    onChange={(e) => handleFilterChange({ ...filters, base: e.target.value })}
                  >
                    <option value="">All Bases</option>
                    <option value="Base Alpha">Base Alpha</option>
                    <option value="Base Bravo">Base Bravo</option>
                    <option value="Base Charlie">Base Charlie</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="active" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="active"
                    name="active"
                    className="mt-1 form-select"
                    value={filters.active}
                    onChange={(e) => handleFilterChange({ ...filters, active: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                    Search
                  </label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    className="mt-1 form-input"
                    placeholder="Search by name, username, or email"
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={() => {
                    setFilters({
                      role: '',
                      base: '',
                      active: '',
                      search: '',
                    });
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowFilters(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('fullName')}
                    >
                      Name
                      {sortBy === 'fullName' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('username')}
                    >
                      Username
                      {sortBy === 'username' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      Email
                      {sortBy === 'email' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('role')}
                    >
                      Role
                      {sortBy === 'role' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Base
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('active')}
                    >
                      Status
                      {sortBy === 'active' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.assignedBase || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          onClick={() => openEditModal(user)}
                        >
                          Edit
                        </button>
                        <button
                          className={user.active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                          onClick={() => handleToggleActive(user._id, user.active)}
                        >
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalItems={totalUsers}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="md"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          title={`Edit User: ${selectedUser.fullName}`}
          size="md"
        >
          <UserEditForm
            user={selectedUser}
            onSubmit={handleUpdateUser}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}
    </>
  );
};

export default UsersPage;