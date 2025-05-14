import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PlusIcon, FunnelIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { Asset, AssetResponse } from "@/types/asset";
import { assetService } from "@/services/assetService";
import { useNotificationStore } from "@/stores/notificationStore";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Pagination from "@/components/ui/Pagination";
import AssetStatusBadge from "@/components/assets/AssetStatusBadge";
import AssetFilterPanel from "@/components/assets/AssetFilterPanel";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const AssetsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  // State for assets list and pagination
  const [assets, setAssets] = useState<Asset[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalAssets, setTotalAssets] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for sorting and filtering
  const [filters, setFilters] = useState({
    base: user?.role === "BaseCommander" ? user.assignedBase : "",
    type: "",
    search: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch assets from API
  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        sortBy,
        sortOrder,
        limit,
        skip: (page - 1) * limit,
      };

      // Add filters to params if they exist
      if (filters.base) params.base = filters.base;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.name = filters.search;

      const response = await assetService.getAssets(params);
      setAssets(response.assets);
      setTotalAssets(response.total);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch assets when dependencies change
  useEffect(() => {
    fetchAssets();
  }, [filters, sortBy, sortOrder, page, limit, user]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
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

  // Handle delete asset
  const openDeleteModal = (asset: Asset) => {
    setAssetToDelete(asset);
    setShowDeleteModal(true);
  };

  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;

    setIsDeleting(true);
    try {
      await assetService.deleteAsset(assetToDelete._id);

      // Add notification
      addNotification({
        type: "success",
        title: "Asset Deleted",
        message: `Asset ${assetToDelete.name} has been deleted successfully.`,
      });

      toast.success("Asset deleted successfully");

      // Close modal and refresh asset list
      setShowDeleteModal(false);
      setAssetToDelete(null);
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Failed to delete asset");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && assets.length === 0) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>Assets | Military Asset Management</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Assets</h1>
            <div className="flex space-x-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
              {(user?.role === "Admin" ||
                user?.role === "LogisticsOfficer") && (
                <Link href="/assets/new" className="btn btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Asset
                </Link>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <AssetFilterPanel
              filters={{
                base: filters.base ?? "",
                type: filters.type,
                search: filters.search,
              }}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          )}

          {/* Assets Table */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}

            {!isLoading && assets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assets found.{" "}
                {(user?.role === "Admin" ||
                  user?.role === "LogisticsOfficer") && (
                  <Link
                    href="/assets/new"
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Add a new asset
                  </Link>
                )}
              </div>
            )}

            {!isLoading && assets.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        Name
                        {sortBy === "name" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("type")}
                      >
                        Type
                        {sortBy === "type" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("base")}
                      >
                        Base
                        {sortBy === "base" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("available")}
                      >
                        Available
                        {sortBy === "available" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("assigned")}
                      >
                        Assigned
                        {sortBy === "assigned" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
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
                    {assets.map((asset: Asset) => (
                      <tr key={asset._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link
                            href={`/assets/${asset._id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {asset.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.base}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.available}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.assigned}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <AssetStatusBadge
                            available={asset.available}
                            total={asset.closingBalance}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/assets/${asset._id}`}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            View
                          </Link>
                          {(user?.role === "Admin" ||
                            user?.role === "LogisticsOfficer") && (
                            <>
                              <Link
                                href={`/assets/${asset._id}/edit`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Edit
                              </Link>
                              {user?.role === "Admin" && (
                                <button
                                  onClick={() => openDeleteModal(asset)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && assets.length > 0 && (
              <Pagination
                currentPage={page}
                totalItems={totalAssets}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAssetToDelete(null);
        }}
        title="Delete Asset"
        size="sm"
      >
        <div className="py-4">
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{assetToDelete?.name}</span>? This
            action cannot be undone.
          </p>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setAssetToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteAsset}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                "Delete Asset"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssetsPage;
