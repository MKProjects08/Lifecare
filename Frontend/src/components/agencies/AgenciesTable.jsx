import React, { useState, useEffect } from 'react';
import { agencyService } from '../../services/agencyService';
import AgencyModal from './AgencyModal';

const AgenciesTable = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      setError('');
      const agenciesData = await agencyService.getAllAgencies();
      setAgencies(agenciesData);
    } catch (err) {
      setError('Failed to load agencies: ' + err.message);
      console.error('Error loading agencies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (agency) => {
    setSelectedAgency(agency);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (agency) => {
    setSelectedAgency(agency);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedAgency(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleDelete = async (agency) => {
    if (window.confirm(`Are you sure you want to delete agency "${agency.agencyname}"? This action cannot be undone.`)) {
      try {
        await agencyService.deleteAgency(agency.Agency_ID || agency.id);
        await loadAgencies();
        alert('Agency deleted successfully!');
      } catch (err) {
        setError('Failed to delete agency: ' + err.message);
        console.error('Error deleting agency:', err);
      }
    }
  };

  const handleSave = async (agencyData) => {
    try {
      if (modalMode === 'add') {
        await agencyService.createAgency(agencyData);
        alert('Agency added successfully!');
      } else if (modalMode === 'edit') {
        const agencyId = selectedAgency.Agency_ID || selectedAgency.id;
        await agencyService.updateAgency(agencyId, agencyData);
        alert('Agency updated successfully!');
      }
      
      await loadAgencies();
      setIsModalOpen(false);
      setSelectedAgency(null);
    } catch (err) {
      setError(`Failed to ${modalMode === 'add' ? 'add' : 'update'} agency: ` + err.message);
      console.error(`Error ${modalMode === 'add' ? 'adding' : 'updating'} agency:`, err);
      throw err;
    }
  };

  const handleRetry = () => {
    loadAgencies();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive !== false 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div>
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

      {/* Add Agency Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
        </div>
        <button
          onClick={handleAdd}
          className="bg-[#29996B]  text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Agency
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#E1F2F5]">
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Agency Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Contact Person</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Phone</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Sales</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Target</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agencies.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 px-4 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-lg font-medium">No agencies found</p>
                    <p className="text-sm mb-4">Get started by adding your first agency</p>
                    <button
                      onClick={handleAdd}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add First Agency
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              agencies.map((agency) => (
                <tr key={agency.Agency_ID || agency.id} className="border-b border-[#E1F2F5] hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{agency.agencyname}</p>
                      <p className="text-xs text-gray-500">
                        ID: {agency.Agency_ID || agency.id}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{agency.contact_person}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{agency.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{agency.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-green-600">{formatCurrency(agency.sales || 0)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-blue-600">{formatCurrency(agency.target || 0)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(agency.is_active)}`}>
                      {agency.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(agency)}
                        className="flex items-center  text-white px-3 py-1 rounded text-sm"
                        title="View Agency"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="#3F75B0" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(agency)}
                        className="flex items-center  text-white px-3 py-1 roundedtext-sm"
                        title="Edit Agency"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="#29996B" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(agency)}
                        className="flex items-center  text-white px-3 py-1 rounded  text-sm"
                        title="Delete Agency"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="#DC3D3D" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Agency Modal */}
      {isModalOpen && (
        <AgencyModal
          agency={selectedAgency}
          mode={modalMode}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAgency(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AgenciesTable;