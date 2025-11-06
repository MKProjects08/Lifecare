import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import Loading from "../../components/layout/Loading";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PRIMARY = "#048dcc";
const TEXT1 = "#1F2937"; // Assuming a dark text color; adjust as needed

const CreatePassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ temp: "", new: "", confirm: "" });
  const [isLoading, setIsLoading] = useState(false);
  const email = localStorage.getItem("username");

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%?&])[A-Za-z\d@#$!%?&]{8,}$/;

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);

    if (value && !passwordRegex.test(value)) {
      setErrors((prev) => ({
        ...prev,
        new: "Password must be at least 8 chars, include uppercase, lowercase, number, and special character.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, new: "" }));
    }

    if (confirmPassword && value !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirm: "Passwords do not match." }));
    } else if (confirmPassword) {
      setErrors((prev) => ({ ...prev, confirm: "" }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value && value !== newPassword) {
      setErrors((prev) => ({ ...prev, confirm: "Passwords do not match." }));
    } else {
      setErrors((prev) => ({ ...prev, confirm: "" }));
    }
  };

  const handleReset = async () => {
    if (errors.new || errors.confirm || !newPassword || !confirmPassword) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      // Hardcoded response for demo - simulates successful password reset
      const data = {
        success: true,
        message: "Password reset successfully",
      };

      if (data.success) {
        toast.success(data.message || "Password reset successfully");
        localStorage.removeItem("token");

        setTimeout(() => navigate("/signin"), 1500);
      } else {
        // toast.error("Failed to reset password.");
      }
    } catch (err) {
      // toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleReset();
  };

  return (
    <div className="flex items-center justify-center min-h-screen mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-6 w-full max-w-md">
        <img src={logo} alt="Logo" className="mx-auto p-2 w-50 h-30" />

        <div>
          <h2  className="text-3xl leading-9 font-extrabold text-[#039e3f]">
            Create your password
          </h2>
          <p className="text-gray-500 text-[14px] leading-tight mt-2 ">
            Set a strong new password to secure your account.
          </p>
        </div>

        {!isLoading ? (
          <div className="space-y-6">
            {/* New Password */}
            <div className="text-left">
              <input
                type="password"
                placeholder="New password"
                className={`base_input w-full p-2 border rounded-md ${
                  errors.new ? "border-red-500" : "border-gray-300"
                }`}
                value={newPassword}
                onChange={handleNewPasswordChange}
                onKeyDown={handleKeyDown}
              />
              {errors.new && (
                <p className="text-[#e23131] text-sm mt-1">{errors.new}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="text-left">
              <input
                type="password"
                placeholder="Confirm password"
                className={`base_input w-full p-2 border rounded-md ${
                  errors.confirm ? "border-red-500" : "border-gray-300"
                }`}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onKeyDown={handleKeyDown}
              />
              {errors.confirm && (
                <p className="text-[#e23131] text-sm mt-1">{errors.confirm}</p>
              )}
            </div>

            {/* Reset Button */}
            <button
              className={`rounded-md p-4 w-full mt-4 font-medium ${
                !newPassword || !confirmPassword
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleReset}
              disabled={!newPassword || !confirmPassword}
              style={{ 
                backgroundColor: PRIMARY, 
                color: TEXT1 
              }}
            >
              Confirm
            </button>
          </div>
        ) : (
          <Loading />
        )}
        <ToastContainer
          position="top-right z-40"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </div>
    </div>
  );
};

export default CreatePassword;