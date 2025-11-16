// src/components/users/UsersTable.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { userService } from '../services/userService';
import UserModal from '../components/users/UserModal';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* -----------------------------------------------------------------
     FETCH USERS
  ----------------------------------------------------------------- */
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const usersData = await userService.getAllUsers();
      setUsers(usersData || []);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when rowsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -----------------------------------------------------------------
     DYNAMIC ROWS-PER-PAGE OPTIONS (4 options)
  ----------------------------------------------------------------- */
  const pageSizeOptions = useMemo(() => {
    const total = users.length;
    if (total === 0) return [10];

    const options = new Set();
    options.add(total);
    let power = 1;
    while (power <= total) {
      options.add(power);
      power *= 2;
    }
    [2, 3, 5, 10].forEach((divisor) => {
      const val = Math.floor(total / divisor);
      if (val >= 5 && val <= total) options.add(val);
    });
    const sorted = Array.from(options).sort((a, b) => a - b);
    return sorted.slice(-4);
  }, [users.length]);

  /* -----------------------------------------------------------------
     DEFAULT ROWS-PER-PAGE – largest when less than or equal to 10, allow any selection
  ----------------------------------------------------------------- */
  useEffect(() => {
    const total = users.length;

    if (total === 0) {
      setRowsPerPage(10);
      return;
    }

    const lastOption = pageSizeOptions[pageSizeOptions.length - 1];

    // First render: if total less than or equal to 10 → default to largest
    if (total <= 10 && rowsPerPage === 10) {
      setRowsPerPage(lastOption);
      return;
    }

    // Reset if current value is invalid
    if (!pageSizeOptions.includes(rowsPerPage)) {
      setRowsPerPage(pageSizeOptions[0] || 10);
    }
  }, [pageSizeOptions, rowsPerPage, users.length]);

  /* -----------------------------------------------------------------
     PAGINATION LOGIC
  ----------------------------------------------------------------- */
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = users.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(users.length / rowsPerPage));

  const getPageNumbers = () => {
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push(-1);
    for (let i = Math.max(2, currentPage - 1); i < currentPage; i++) pages.push(i);
    if (currentPage !== 1 && currentPage !== totalPages) pages.push(currentPage);
    for (let i = currentPage + 1; i <= Math.min(totalPages - 1, currentPage + 2); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push(-1);
    if (totalPages > 1 && pages[pages.length - 1] !== totalPages) pages.push(totalPages);
    return Array.from(new Set(pages.filter(p => p > 0)));
  };

  /* -----------------------------------------------------------------
     CRUD HANDLERS
  ----------------------------------------------------------------- */
  const handleView = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      try {
        await userService.deleteUser(user.User_ID || user.UserID || user.id);
        await loadUsers();
        toast.success('User deleted successfully!');
      } catch (err) {
        setError('Failed to delete user: ' + err.message);
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleSave = async (userData) => {
    try {
      if (modalMode === 'add') {
        await userService.createUser(userData);
        toast.success('User added successfully!');
      } else if (modalMode === 'edit') {
        const userId = selectedUser.User_ID || selectedUser.UserID || selectedUser.id;
        await userService.updateUser(userId, userData);
        toast.success('User updated successfully!');
      }

      await loadUsers();
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(`Failed to ${modalMode === 'add' ? 'add' : 'update'} user: ` + err.message);
      console.error(`Error ${modalMode === 'add' ? 'adding' : 'updating'} user:`, err);
      throw err;
    }
  };

  const handleRetry = () => {
    loadUsers();
  };

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'worker':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isUserActive = (isActive) => {
    return isActive === 1 || isActive === '1' || isActive === true;
  };

  const getStatusBadgeClass = (isActive) => {
    return isUserActive(isActive)
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  /* -----------------------------------------------------------------
     RENDER – LOADING / ERROR
  ----------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <div className="flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={handleRetry}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* -----------------------------------------------------------------
     MAIN RENDER
  ----------------------------------------------------------------- */
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#3F75B0]">User Management</h2>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-4 bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add User Button + Total */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-[17px] text-gray-600 bg-green-200 rounded-full px-2.5 py-0.5">
          Total Users: <span className="font-semibold">{users.length}</span>
        </div>
        <button
          onClick={handleAdd}
          className="bg-[#29996B] text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New User
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#E1F2F5]">
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Username</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Phone</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Role</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm mb-4">Get started by adding your first user</p>
                    <button
                      onClick={handleAdd}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add First User
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              currentRows.map((user) => (
                <tr key={user.User_ID || user.UserID || user.id} className="border-b border-[#E1F2F5] hover:bg-gray-50 text-left">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">
                        ID: {user.User_ID || user.UserID || user.id}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{user.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{user.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                      {user.role || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(user.is_active)}`}>
                      {isUserActive(user.is_active) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(user)}
                        className="flex items-center px-3 py-1 text-sm"
                        title="View User"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="#3F75B0" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex items-center px-3 py-1 rounded text-sm"
                        title="Edit User"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="#29996B" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="flex items-center px-3 py-1 rounded text-sm"
                        title="Delete User"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="#DC3D3D" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-700">Rows per page:</span>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {rowsPerPage}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {pageSizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setRowsPerPage(size);
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-blue-100 transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          
        </div>

        <div className="text-sm font-semibold text-gray-700">
          Total Users: {users.length}
        </div>
      </div>

      {/* Pagination Buttons */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex justify-center items-center space-x-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>

          {getPageNumbers().length > 0 ? (
            getPageNumbers().map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  currentPage === num
                    ? "bg-[#3F75B0] text-white"
                    : "border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            ))
          ) : (
            <button className="px-3 py-1 rounded text-sm font-medium bg-[#3F75B0] text-white">
              1
            </button>
          )}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Showing {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, users.length)} of {users.length} users
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleSave}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UsersTable;