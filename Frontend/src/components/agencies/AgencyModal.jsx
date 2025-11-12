import React, { useState, useEffect } from 'react';

const AgencyModal = ({ agency, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    agencyname: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    sales: 0,
    target: 0
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agency && (mode === 'edit' || mode === 'view')) {
      setFormData({
        agencyname: agency.agencyname || '',
        contact_person: agency.contact_person || '',
        phone: agency.phone || '',
        email: agency.email || '',
        address: agency.address || '',
        sales: agency.sales || 0,
        target: agency.target || 0
      });
    } else {
      // Reset form for add mode
      setFormData({
        agencyname: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        sales: 0,
        target: 0
      });
    }
  }, [agency, mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.agencyname.trim()) {
      newErrors.agencyname = 'Agency name is required';
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = 'Contact person is required';
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

    if (formData.sales < 0) {
      newErrors.sales = 'Sales cannot be negative';
    }

    if (formData.target < 0) {
      newErrors.target = 'Target cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
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
      console.error('Error saving agency:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'add': return 'Add New Agency';
      case 'edit': return 'Edit Agency';
      case 'view': return 'Agency Details';
      default: return 'Agency';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">

      <div className="px-6 py-4 border-b bg-[#E1F2F5] border-gray-200 flex items-center justify-between">

          <h2 className="text-xl font-bold text-[#3F75B0]">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 text-left ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agency Name */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Agency Name *
              </label>
              <input
                type="text"
                name="agencyname"
                value={formData.agencyname}
                onChange={handleChange}
                disabled={mode === 'view'}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-text-[#3F75B0] ${
                  errors.agencyname ? 'border-red-500' : 'border-gray-300'
                } ${mode === 'view' ? 'bg-gray-100' : ''}`}
                placeholder="Enter agency name"
              />
              {errors.agencyname && (
                <p className="text-red-500 text-xs mt-1">{errors.agencyname}</p>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                disabled={mode === 'view'}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-text-[#3F75B0] ${
                  errors.contact_person ? 'border-red-500' : 'border-gray-300'
                } ${mode === 'view' ? 'bg-gray-100' : ''}`}
                placeholder="Enter contact person name"
              />
              {errors.contact_person && (
                <p className="text-red-500 text-xs mt-1">{errors.contact_person}</p>
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
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-text-[#3F75B0] ${
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
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-text-[#3F75B0] ${
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
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-text-[#3F75B0] ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              } ${mode === 'view' ? 'bg-gray-100' : ''}`}
              placeholder="Enter full address"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sales */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Sales ($)
              </label>
              <input
                type="number"
                name="sales"
                value={formData.sales}
                onChange={handleChange}
                disabled={mode === 'view'}
                min="0"
                step="0.01"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-text-[#3F75B0] ${
                  errors.sales ? 'border-red-500' : 'border-gray-300'
                } ${mode === 'view' ? 'bg-gray-100' : ''}`}
                placeholder="Enter sales amount"
              />
              {errors.sales && (
                <p className="text-red-500 text-xs mt-1">{errors.sales}</p>
              )}
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Target ($)
              </label>
              <input
                type="number"
                name="target"
                value={formData.target}
                onChange={handleChange}
                disabled={mode === 'view'}
                min="0"
                step="0.01"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-text-[#3F75B0] ${
                  errors.target ? 'border-red-500' : 'border-gray-300'
                } ${mode === 'view' ? 'bg-gray-100' : ''}`}
                placeholder="Enter target amount"
              />
              {errors.target && (
                <p className="text-red-500 text-xs mt-1">{errors.target}</p>
              )}
            </div>
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
                className="px-4 py-2 bg-[#29996B]  text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {mode === 'add' ? 'Add Agency' : 'Update Agency'}
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

export default AgencyModal;