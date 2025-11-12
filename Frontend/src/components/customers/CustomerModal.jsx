import React, { useState, useEffect } from 'react';

const CustomerModal = ({ customer, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    pharmacyname: '',
    owner_name: '',
    phone: '',
    address: '',
    email: '',
    credits: 0,
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && (mode === 'edit' || mode === 'view')) {
      setFormData({
        pharmacyname: customer.pharmacyname || '',
        owner_name: customer.owner_name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        email: customer.email || '',
        credits: customer.credits || 0,
        is_active: customer.is_active !== false
      });
    } else {
      // Reset form for add mode
      setFormData({
        pharmacyname: '',
        owner_name: '',
        phone: '',
        address: '',
        email: '',
        credits: 0,
        is_active: true
      });
    }
  }, [customer, mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pharmacyname.trim()) {
      newErrors.pharmacyname = 'Pharmacy name is required';
    }

    if (!formData.owner_name.trim()) {
      newErrors.owner_name = 'Owner name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.credits < 0) {
      newErrors.credits = 'Credits cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : (type === 'checkbox' ? !!checked : value)
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'add': return 'Add New Pharmacy';
      case 'edit': return 'Edit Pharmacy';
      case 'view': return 'Pharmacy Details';
      default: return 'Pharmacy';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg  w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b bg-[#E1F2F5] border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pharmacy Name */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Pharmacy Name *
              </label>
              <input
                type="text"
                name="pharmacyname"
                value={formData.pharmacyname}
                onChange={handleChange}
                disabled={mode === 'view'}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0] ${
                  errors.pharmacyname ? 'border-red-500' : 'border-gray-300'
                } ${mode === 'view' ? 'bg-gray-100' : ''}`}
                placeholder="Enter pharmacy name"
              />
              {errors.pharmacyname && (
                <p className="text-red-500 text-xs mt-1">{errors.pharmacyname}</p>
              )}
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Owner Name *
              </label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                disabled={mode === 'view'}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0] ${
                  errors.owner_name ? 'border-red-500' : 'border-gray-300'
                } ${mode === 'view' ? 'bg-gray-100' : ''}`}
                placeholder="Enter owner name"
              />
              {errors.owner_name && (
                <p className="text-red-500 text-xs mt-1">{errors.owner_name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={mode === 'view'}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0] ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } ${mode === 'view' ? 'bg-gray-100' : ''}`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={mode === 'view'}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0] ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } ${mode === 'view' ? 'bg-gray-100' : ''}`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-[#3F75B0] mb-1">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={mode === 'view'}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0] ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              } ${mode === 'view' ? 'bg-gray-100' : ''}`}
              placeholder="Enter full address"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <label className="block text-sm font-medium text-[#3F75B0]">
              Active
            </label>
            <input
              type="checkbox"
              name="is_active"
              checked={!!formData.is_active}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="h-4 w-4"
            />
          </div>

          {/* Credits */}
          <div>
            <label className="block text-sm font-medium text-[#3F75B0] mb-1">
              Credits ($)
            </label>
            <input
              type="number"
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              disabled={mode === 'view'}
              min="0"
              step="0.01"
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0] ${
                errors.credits ? 'border-red-500' : 'border-gray-300'
              } ${mode === 'view' ? 'bg-gray-100' : ''}`}
              placeholder="Enter credit amount"
            />
            {errors.credits && (
              <p className="text-red-500 text-xs mt-1">{errors.credits}</p>
            )}
          </div>

          {/* Action Buttons */}
          {mode !== 'view' && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2  bg-[#29996B] text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {mode === 'add' ? 'Add Pharmacy' : 'Update Pharmacy'}
              </button>
            </div>
          )}

          {mode === 'view' && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;