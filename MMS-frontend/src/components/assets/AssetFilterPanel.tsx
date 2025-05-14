import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface AssetFilterPanelProps {
  filters: {
    base: string;
    type: string;
    search: string;
  };
  onFilterChange: (filters: any) => void;
  onClose: () => void;
}

const AssetFilterPanel = ({ filters, onFilterChange, onClose }: AssetFilterPanelProps) => {
  const { user } = useAuth();
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

const handleReset = () => {
  const resetFilters = {
    base: user?.role === 'BaseCommander' ? user.assignedBase ?? '' : '',
    type: '',
    search: '',
  };
  setLocalFilters(resetFilters);
  onFilterChange(resetFilters);
};

  return (
    <div className="mt-4 bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500"
          onClick={onClose}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {user?.role !== 'BaseCommander' && (
            <div>
              <label htmlFor="base" className="block text-sm font-medium text-gray-700">
                Base
              </label>
              <select
                id="base"
                name="base"
                className="mt-1 form-select"
                value={localFilters.base}
                onChange={handleInputChange}
              >
                <option value="">All Bases</option>
                <option value="Base Alpha">Base Alpha</option>
                <option value="Base Bravo">Base Bravo</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Asset Type
            </label>
            <select
              id="type"
              name="type"
              className="mt-1 form-select"
              value={localFilters.type}
              onChange={handleInputChange}
            >
              <option value="">All Types</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Weapon">Weapon</option>
              <option value="Ammunition">Ammunition</option>
              <option value="Equipment">Equipment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              name="search"
              id="search"
              className="mt-1 form-input"
              placeholder="Search by name"
              value={localFilters.search}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetFilterPanel;