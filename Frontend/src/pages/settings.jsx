import React, { useCallback, useEffect, useState } from "react";
import { userService } from "../services/userService";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "",
    is_active: true,
    created_at: "",
    password: "",
    confirmPassword: "",
  });

  const [originalData, setOriginalData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const getCurrentUserFromStorage = () => {
    try {
      const username = localStorage.getItem("username");
      const adminId = localStorage.getItem("adminId");
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");
      const id = userId || adminId;
      if (id) return { id, username, role };

      const userJson = localStorage.getItem("user");
      if (userJson) {
        const u = JSON.parse(userJson);
        return {
          id: u.User_ID || u.UserID || u.id,
          username: u.username,
          role: u.role,
        };
      }
    } catch {}
    return null;
  };

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const cu = getCurrentUserFromStorage();
      if (!cu || !cu.id) throw new Error("No current user context. Please sign in again.");
      setCurrentUserId(cu.id);
      const user = await userService.getUserById(cu.id);
      const base = {
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        is_active: user.is_active !== false,
        created_at: user.created_at || "",
      };
      setOriginalData(base);
      setFormData({ ...base, password: "", confirmPassword: "" });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      if (originalData) setFormData({ ...originalData, password: "", confirmPassword: "" });
      setIsEditing(false);
      setError("");
      setSuccess("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (!currentUserId) throw new Error("No current user context");
      if (formData.password || formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
      }
      setSaving(true);
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };
      if (formData.password) payload.password = formData.password;
      await userService.updateUser(currentUserId, payload);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
      const updated = { ...originalData, ...payload };
      setOriginalData(updated);
      setFormData((prev) => ({ ...prev, ...payload, password: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    try { return new Date(d).toLocaleString(); } catch { return d; }
  };

  return (
    <div className="p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[#3F75B0]">Settings</h1>
          <div className="flex gap-2">
            <button onClick={loadUser} className="bg-[#048dcc] text-white px-4 py-2 rounded-lg hover:bg-[#3F75B0]">
              Refresh
            </button>
            <button onClick={handleEditToggle} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300" disabled={loading}>
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} disabled={!isEditing} className={`w-full border rounded-md px-3 py-2 ${isEditing ? 'border-gray-300' : 'bg-gray-100 border-gray-200 cursor-not-allowed'}`} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={`w-full border rounded-md px-3 py-2 ${isEditing ? 'border-gray-300' : 'bg-gray-100 border-gray-200 cursor-not-allowed'}`} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={`w-full border rounded-md px-3 py-2 ${isEditing ? 'border-gray-300' : 'bg-gray-100 border-gray-200 cursor-not-allowed'}`} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">Role (read-only)</label>
              <input type="text" name="role" value={formData.role} readOnly disabled className="w-full border rounded-md px-3 py-2 bg-gray-100 border-gray-200 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">Active (read-only)</label>
              <input type="text" value={formData.is_active ? 'Yes' : 'No'} readOnly disabled className="w-full border rounded-md px-3 py-2 bg-gray-100 border-gray-200 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">Created At</label>
              <input type="text" value={formatDate(formData.created_at)} readOnly disabled className="w-full border rounded-md px-3 py-2 bg-gray-100 border-gray-200 cursor-not-allowed" />
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3F75B0] mb-1">New Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border rounded-md px-3 py-2 border-gray-300" placeholder="Leave blank to keep current" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3F75B0] mb-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full border rounded-md px-3 py-2 border-gray-300" placeholder="Re-enter new password" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave password fields empty if you don't want to change it.</p>
            </div>
          )}
          {isEditing && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#29996B] text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};
export default Settings;