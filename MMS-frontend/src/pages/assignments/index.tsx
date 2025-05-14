import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { PlusIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { assignmentService } from "@/services/assignmentService";
import { useNotificationStore } from "@/stores/notificationStore";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { Assignment } from "@/types/assignment";
import toast from "react-hot-toast";

const AssignmentsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  // State for assignments list and pagination
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for sorting and filtering
  const [filters, setFilters] = useState({
    base: user?.role === "BaseCommander" ? user.assignedBase : "",
    assetType: "",
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // State for action modals
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [returnQuantity, setReturnQuantity] = useState(0);
  const [statusNotes, setStatusNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch assignments from API
  const fetchAssignments = async () => {
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
      if (filters.assetType) params.assetType = filters.assetType;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.search) params.search = filters.search;

      const response = await assignmentService.getAssignments(params);
      setAssignments(response.assignments);
      setTotalAssignments(response.total);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch assignments when dependencies change
  useEffect(() => {
    fetchAssignments();
  }, [filters, sortBy, sortOrder, page, limit, user]);

  // Add click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdowns = document.querySelectorAll('[id^="status-dropdown-"]');
      dropdowns.forEach((dropdown) => {
        if (
          dropdown instanceof HTMLElement &&
          !dropdown.contains(event.target as Node)
        ) {
          dropdown.classList.add("hidden");
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
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

  // Handle return assignment
  const openReturnModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setReturnQuantity(assignment.quantity - assignment.returnedQuantity);
    setShowReturnModal(true);
  };

  const handleReturnAssignment = async () => {
    if (!selectedAssignment) return;

    setIsProcessing(true);
    try {
      const updatedAssignment = await assignmentService.returnAssignment(
        selectedAssignment._id,
        {
          returnedQuantity: returnQuantity,
          notes: statusNotes || undefined,
        }
      );

      // Add notification
      addNotification({
        type: "success",
        title: "Assignment Returned",
        message: `${returnQuantity} ${updatedAssignment.assetName} returned successfully.`,
      });

      toast.success("Assignment returned successfully");

      // Close modal and refresh assignment list
      setShowReturnModal(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (error) {
      console.error("Error returning assignment:", error);
      toast.error("Failed to return assignment");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle status update
  const openStatusModal = (assignment: Assignment, status: string) => {
    setSelectedAssignment(assignment);
    setNewStatus(status);
    setStatusNotes("");
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedAssignment || !newStatus) return;

    setIsProcessing(true);
    try {
      const updatedAssignment = await assignmentService.updateAssignmentStatus(
        selectedAssignment._id,
        {
          status: newStatus,
          notes: statusNotes || undefined,
        }
      );

      // Add notification
      addNotification({
        type: "success",
        title: "Assignment Updated",
        message: `Assignment status changed to ${newStatus}.`,
      });

      toast.success(`Assignment marked as ${newStatus}`);

      // Close modal and refresh assignment list
      setShowStatusModal(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (error) {
      console.error("Error updating assignment status:", error);
      toast.error("Failed to update assignment status");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function for status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Returned":
        return "bg-blue-100 text-blue-800";
      case "Lost":
        return "bg-red-100 text-red-800";
      case "Damaged":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if user can create assignments
  const canCreateAssignment =
    user?.role === "Admin" || user?.role === "BaseCommander";

  // Check if user can return assignments
  const canReturnAssignment = (assignment: Assignment) => {
    if (assignment.status !== "Active") return false;

    return (
      user?.role === "Admin" ||
      user?.role === "LogisticsOfficer" ||
      (user?.role === "BaseCommander" && user.assignedBase === assignment.base)
    );
  };

  // Check if user can update assignment status
  const canUpdateStatus = (assignment: Assignment) => {
    if (assignment.status !== "Active") return false;

    return (
      user?.role === "Admin" ||
      (user?.role === "BaseCommander" && user.assignedBase === assignment.base)
    );
  };

  if (isLoading && assignments.length === 0) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>Assignments | Military Asset Management</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Assignments
            </h1>
            <div className="flex space-x-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
              {canCreateAssignment && (
                <Link href="/assignments/new" className="btn btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Assignment
                </Link>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 bg-white p-4 shadow rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="base"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Base
                  </label>
                  <select
                    id="base"
                    name="base"
                    className="mt-1 form-select"
                    value={filters.base}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, base: e.target.value })
                    }
                    disabled={user?.role === "BaseCommander"}
                  >
                    <option value="">All Bases</option>
                    <option value="Base Alpha">Base Alpha</option>
                    <option value="Base Bravo">Base Bravo</option>
                    <option value="Base Charlie">Base Charlie</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="assetType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Asset Type
                  </label>
                  <select
                    id="assetType"
                    name="assetType"
                    className="mt-1 form-select"
                    value={filters.assetType}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        assetType: e.target.value,
                      })
                    }
                  >
                    <option value="">All Types</option>
                    <option value="Weapon">Weapon</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Ammunition">Ammunition</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="mt-1 form-select"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, status: e.target.value })
                    }
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Returned">Returned</option>
                    <option value="Lost">Lost</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="mt-1 form-input"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="mt-1 form-input"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Search
                  </label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    className="mt-1 form-input"
                    placeholder="Search by asset name, personnel, or purpose"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, search: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={() => {
                    setFilters({
                      base:
                        user?.role === "BaseCommander" ? user.assignedBase : "",
                      assetType: "",
                      status: "",
                      startDate: "",
                      endDate: "",
                      search: "",
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

          {/* Assignments Table */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}

            {!isLoading && assignments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assignments found.{" "}
                {canCreateAssignment && (
                  <Link
                    href="/assignments/new"
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Create a new assignment
                  </Link>
                )}
              </div>
            )}

            {!isLoading && assignments.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("assetName")}
                      >
                        Asset
                        {sortBy === "assetName" && (
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
                        onClick={() => handleSort("assignedTo.name")}
                      >
                        Assigned To
                        {sortBy === "assignedTo.name" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("quantity")}
                      >
                        Quantity
                        {sortBy === "quantity" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("purpose")}
                      >
                        Purpose
                        {sortBy === "purpose" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        {sortBy === "status" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("startDate")}
                      >
                        Start Date
                        {sortBy === "startDate" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
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
                    {assignments.map((assignment) => (
                      <tr key={assignment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link
                            href={`/assets/${assignment.asset}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {assignment.assetName}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {assignment.assetType}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.base}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {assignment.assignedTo.name}
                            <p className="text-xs text-gray-500">
                              {assignment.assignedTo.rank} (
                              {assignment.assignedTo.id})
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.quantity}
                          {assignment.returnedQuantity > 0 && (
                            <p className="text-xs text-gray-500">
                              {assignment.returnedQuantity} returned
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              assignment.status
                            )}`}
                          >
                            {assignment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(
                            new Date(assignment.startDate),
                            "MMM d, yyyy"
                          )}
                          {assignment.endDate && (
                            <p className="text-xs text-gray-500">
                              to{" "}
                              {format(
                                new Date(assignment.endDate),
                                "MMM d, yyyy"
                              )}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/assignments/${assignment._id}`}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            View
                          </Link>
                          {canReturnAssignment(assignment) && (
                            <button
                              className="text-green-600 hover:text-green-900 mr-4"
                              onClick={() => openReturnModal(assignment)}
                            >
                              Return
                            </button>
                          )}
                          {canUpdateStatus(assignment) && (
                            <div className="inline-block relative">
                              <button
                                className="text-orange-600 hover:text-orange-900"
                                onClick={() => {
                                  const dropdown = document.getElementById(
                                    `status-dropdown-${assignment._id}`
                                  );
                                  if (dropdown) {
                                    dropdown.classList.toggle("hidden");
                                  }
                                }}
                              >
                                Status ▾
                              </button>
                              <div
                                id={`status-dropdown-${assignment._id}`}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden"
                              >
                                <button
                                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                  onClick={() =>
                                    openStatusModal(assignment, "Lost")
                                  }
                                >
                                  Mark as Lost
                                </button>
                                <button
                                  className="block px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 w-full text-left"
                                  onClick={() =>
                                    openStatusModal(assignment, "Damaged")
                                  }
                                >
                                  Mark as Damaged
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && assignments.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-3">
                <Pagination
                  currentPage={page}
                  totalItems={totalAssignments}
                  itemsPerPage={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return Assignment Modal */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => {
          setShowReturnModal(false);
          setSelectedAssignment(null);
        }}
        title="Return Assignment"
        size="md"
      >
        <div className="py-4">
          {selectedAssignment && (
            <>
              <p className="text-gray-700 mb-4">
                Return {selectedAssignment.assetName} assigned to{" "}
                {selectedAssignment.assignedTo.name}
              </p>

              <div className="mb-4">
                <label
                  htmlFor="returnQuantity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Quantity to Return
                </label>
                <input
                  type="number"
                  id="returnQuantity"
                  className="mt-1 form-input"
                  min="1"
                  max={
                    selectedAssignment.quantity -
                    selectedAssignment.returnedQuantity
                  }
                  value={returnQuantity}
                  onChange={(e) => setReturnQuantity(parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedAssignment.quantity -
                    selectedAssignment.returnedQuantity}{" "}
                  available to return
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="statusNotes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="statusNotes"
                  className="mt-1 form-textarea"
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes about the returned items"
                />
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowReturnModal(false);
                setSelectedAssignment(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleReturnAssignment}
              disabled={
                isProcessing ||
                returnQuantity < 1 ||
                (selectedAssignment != null &&
                  returnQuantity >
                    selectedAssignment.quantity -
                      selectedAssignment.returnedQuantity)
              }
            >
              {isProcessing ? (
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
                  Processing...
                </span>
              ) : (
                "Return Items"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedAssignment(null);
        }}
        title={`Mark Assignment as ${newStatus}`}
        size="md"
      >
        <div className="py-4">
          {selectedAssignment && (
            <>
              <p className="text-gray-700 mb-4">
                Are you sure you want to mark the assignment of{" "}
                <span className="font-semibold">
                  {selectedAssignment.quantity} {selectedAssignment.assetName}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {selectedAssignment.assignedTo.name}
                </span>{" "}
                as <span className="font-semibold">{newStatus}</span>?
              </p>

              <div className="mb-4">
                <label
                  htmlFor="statusNotes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Notes (Required)
                </label>
                <textarea
                  id="statusNotes"
                  className="mt-1 form-textarea"
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder={`Please provide details about why the items are ${newStatus.toLowerCase()}`}
                />
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedAssignment(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleUpdateStatus}
              disabled={isProcessing || !statusNotes.trim()}
            >
              {isProcessing ? (
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
                  Processing...
                </span>
              ) : (
                `Confirm ${newStatus} Status`
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssignmentsPage;
