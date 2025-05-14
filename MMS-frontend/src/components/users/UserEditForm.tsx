import React, { useState, useEffect } from 'react';
import { User } from '@/types/user';

interface UserEditFormProps {
  user: User;
  onSubmit: (id: string, data: {
    fullName?: string;
    email?: string;
    role?: string;
    assignedBase?: string;
    active?: boolean;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const UserEditForm: React.FC<UserEditFormProps> = ({ 
  user, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    assignedBase: user.assignedBase || '',
    active: user.active
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when user prop changes
  useEffect(() => {
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      assignedBase: user.assignedBase || '',
      active: user.active
    });
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.role !== 'Admin' && !formData.assignedBase) {
      newErrors.assignedBase = 'Assigned base is required for this role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(user._id, formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`mt-1 form-input block w-full ${errors.fullName ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`mt-1 form-input block w-full ${errors.email ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 form-select block w-full"
          disabled={isSubmitting}
        >
          <option value="Admin">Admin</option>
          <option value="BaseCommander">Base Commander</option>
          <option value="LogisticsOfficer">Logistics Officer</option>
        </select>
      </div>
      
      {formData.role !== 'Admin' && (
        <div>
          <label htmlFor="assignedBase" className="block text-sm font-medium text-gray-700">
            Assigned Base
          </label>
          <select
            id="assignedBase"
            name="assignedBase"
            value={formData.assignedBase}
            onChange={handleChange}
            className={`mt-1 form-select block w-full ${errors.assignedBase ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          >
            <option value="">Select a base</option>
            <option value="Base Alpha">Base Alpha</option>
            <option value="Base Bravo">Base Bravo</option>
            <option value="Base Charlie">Base Charlie</option>
          </select>
          {errors.assignedBase && (
            <p className="mt-1 text-sm text-red-600">{errors.assignedBase}</p>
          )}
        </div>
      )}
      
      <div className="flex items-center">
        <input
          id="active"
          name="active"
          type="checkbox"
          checked={formData.active}
          onChange={handleChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          disabled={isSubmitting}
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
          Active
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default UserEditForm;