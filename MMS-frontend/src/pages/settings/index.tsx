import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import { SystemSettings } from '@/services/settingsService';

// Mock settings data
const mockSettings: SystemSettings = {
  systemName: 'Military Asset Management System',
  organizationName: 'Department of Defense',
  logo: '/logo.png',
  theme: 'default',
  defaultCurrency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: 'America/New_York',
  emailNotifications: true,
  maintenanceMode: false,
  assetTypes: ['Weapon', 'Vehicle', 'Equipment', 'Ammunition', 'Medical', 'Food'],
  bases: ['Base Alpha', 'Base Bravo', 'Base Charlie'],
};

const SettingsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSettings>(mockSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [newAssetType, setNewAssetType] = useState('');
  const [newBase, setNewBase] = useState('');

  // Check if user has admin access
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      toast.error('You do not have permission to access this page');
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load settings
  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setSettings(mockSettings);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSaveSettings = () => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Settings saved successfully');
      setIsLoading(false);
    }, 500);
  };

  const handleAddAssetType = () => {
    if (!newAssetType.trim()) {
      toast.error('Please enter an asset type');
      return;
    }

    if (settings.assetTypes.includes(newAssetType.trim())) {
      toast.error('Asset type already exists');
      return;
    }

    setSettings({
      ...settings,
      assetTypes: [...settings.assetTypes, newAssetType.trim()],
    });
    setNewAssetType('');
    toast.success('Asset type added successfully');
  };

  const handleRemoveAssetType = (type: string) => {
    setSettings({
      ...settings,
      assetTypes: settings.assetTypes.filter(t => t !== type),
    });
    toast.success('Asset type removed successfully');
  };

  const handleAddBase = () => {
    if (!newBase.trim()) {
      toast.error('Please enter a base name');
      return;
    }

    if (settings.bases.includes(newBase.trim())) {
      toast.error('Base already exists');
      return;
    }

    setSettings({
      ...settings,
      bases: [...settings.bases, newBase.trim()],
    });
    setNewBase('');
    toast.success('Base added successfully');
  };

  const handleRemoveBase = (base: string) => {
    setSettings({
      ...settings,
      bases: settings.bases.filter(b => b !== base),
    });
    toast.success('Base removed successfully');
  };

  const handleToggleMaintenanceMode = () => {
    setSettings({
      ...settings,
      maintenanceMode: !settings.maintenanceMode,
    });
    toast.success(`Maintenance mode ${settings.maintenanceMode ? 'disabled' : 'enabled'}`);
  };

  if (isLoading) return <LoadingScreen />;

  // If not admin, don't render the page
  if (user && user.role !== 'Admin') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Settings | Military Asset Management</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === 'general'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('general')}
              >
                General
              </button>
              <button
                className={`${
                  activeTab === 'assets'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('assets')}
              >
                Asset Types
              </button>
              <button
                className={`${
                  activeTab === 'bases'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('bases')}
              >
                Bases
              </button>
              <button
                className={`${
                  activeTab === 'system'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('system')}
              >
                System
              </button>
            </nav>
          </div>

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  General Settings
                </h3>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="systemName" className="block text-sm font-medium text-gray-700">
                      System Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="systemName"
                        name="systemName"
                        className="form-input"
                        value={settings.systemName}
                        onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                      Organization Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="organizationName"
                        name="organizationName"
                        className="form-input"
                        value={settings.organizationName}
                        onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700">
                      Default Currency
                    </label>
                    <div className="mt-1">
                      <select
                        id="defaultCurrency"
                        name="defaultCurrency"
                        className="form-select"
                        value={settings.defaultCurrency}
                        onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                      Theme
                    </label>
                    <div className="mt-1">
                      <select
                        id="theme"
                        name="theme"
                        className="form-select"
                        value={settings.theme}
                        onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                      >
                        <option value="default">Default</option>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                      Date Format
                    </label>
                    <div className="mt-1">
                      <select
                        id="dateFormat"
                        name="dateFormat"
                        className="form-select"
                        value={settings.dateFormat}
                        onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">
                      Time Format
                    </label>
                    <div className="mt-1">
                      <select
                        id="timeFormat"
                        name="timeFormat"
                        className="form-select"
                        value={settings.timeFormat}
                        onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                      >
                        <option value="12h">12-hour (AM/PM)</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                      Timezone
                    </label>
                    <div className="mt-1">
                      <select
                        id="timezone"
                        name="timezone"
                        className="form-select"
                        value={settings.timezone}
                        onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <div className="flex items-center">
                      <input
                        id="emailNotifications"
                        name="emailNotifications"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                        Enable email notifications
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Asset Types */}
          {activeTab === 'assets' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Asset Types
                </h3>

                <div className="mb-6">
                  <div className="flex">
                    <input
                      type="text"
                      className="form-input flex-1 rounded-r-none"
                      placeholder="Add new asset type"
                      value={newAssetType}
                      onChange={(e) => setNewAssetType(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary rounded-l-none"
                      onClick={handleAddAssetType}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {settings.assetTypes.map((type) => (
                    <div
                      key={type}
                      className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{type}</p>
                      </div>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleRemoveAssetType(type)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bases */}
          {activeTab === 'bases' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Bases
                </h3>

                <div className="mb-6">
                  <div className="flex">
                    <input
                      type="text"
                      className="form-input flex-1 rounded-r-none"
                      placeholder="Add new base"
                      value={newBase}
                      onChange={(e) => setNewBase(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary rounded-l-none"
                      onClick={handleAddBase}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {settings.bases.map((base) => (
                    <div
                      key={base}
                      className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{base}</p>
                      </div>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleRemoveBase(base)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  System Settings
                </h3>

                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-base font-medium text-gray-900">Maintenance Mode</h4>
                      <p className="text-sm text-gray-500">
                        When enabled, only administrators can access the system
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        className={`${
                          settings.maintenanceMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        } inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                        onClick={handleToggleMaintenanceMode}
                      >
                        {settings.maintenanceMode ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-base font-medium text-gray-900 mb-4">System Information</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Version</dt>
                      <dd className="mt-1 text-sm text-gray-900">1.0.0</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date().toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Database Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Connected
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">API Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Operational
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsPage;