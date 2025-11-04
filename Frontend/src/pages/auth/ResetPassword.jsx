import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import Loading from "../../components/layout/Loading";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PRIMARY = "#048dcc";

const TEXT1 = "#1F2937"; // Assuming a dark text color; adjust as needed

const ResetPassword = () => {
  const navigate = useNavigate();
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ temp: "", new: "", confirm: "" });
  const [isLoading, setIsLoading] = useState(false);
  const email = localStorage.getItem("username");
  const savedTempPassword = localStorage.getItem("tempPassword");

  const handleTempPasswordChange = (value) => {
    setTempPassword(value);
    setErrors((prev) => ({
      ...prev,
      temp:
        value && value !== savedTempPassword
          ? "Invalid temporary password"
          : "",
    }));
  };

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%?&])[A-Za-z\d@#$!%?&]{8,}$/;

    setErrors((prev) => ({
      ...prev,
      new:
        value && !passwordRegex.test(value)
          ? "Password must be at least 8 chars, with uppercase, lowercase, number, and special character."
          : "",
      confirm:
        confirmPassword && value !== confirmPassword
          ? "Passwords do not match."
          : "",
    }));
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setErrors((prev) => ({
      ...prev,
      confirm: value && value !== newPassword ? "Passwords do not match." : "",
    }));
  };

  const handleReset = async () => {
    if (errors.temp || errors.new || errors.confirm) return;

    setIsLoading(true);

    try {
      // Hardcoded response for demo - simulates successful password reset
      const data = {
        success: true,
        message: "Password reset successfully",
      };

      if (data.success) {
        toast.success(data.message || "Password reset successfully");
        localStorage.removeItem("tempPassword");

        setTimeout(() => navigate("/signin"), 1500);
      } else {
        // toast.error(data.message);
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
          <h2 className="text-3xl leading-9 font-extrabold text-[#039e3f]">
            Reset your password
          </h2>
          <p className="text-gray-500 text-[14px] leading-tight mt-2 ">
            Enter the temporary password sent to {email} to verify your identity
            and reset your password.
          </p>
        </div>

        {!isLoading ? (
          <div className="space-y-6">
            {/* Temporary Password */}
            <div className="text-left">
              <input
                type="password"
                placeholder="Temporary password"
                className={`base_input w-full p-2 border rounded-md ${
                  errors.temp ? "border-red-500" : "border-gray-300"
                }`}
                value={tempPassword}
                onChange={(e) => handleTempPasswordChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {errors.temp && (
                <p className="text-[#e23131] text-sm mt-1">{errors.temp}</p>
              )}
            </div>

            {/* New Password */}
            <div className="text-left">
              <input
                type="password"
                placeholder="New password"
                className={`base_input w-full p-2 border rounded-md ${
                  errors.new ? "border-red-500" : "border-gray-300"
                }`}
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
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
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {errors.confirm && (
                <p className="text-[#e23131] text-sm mt-1">{errors.confirm}</p>
              )}
            </div>

            {/* Reset Button */}
            <button
              className={`rounded-md p-4 w-full mt-4 font-medium ${
                !tempPassword || !newPassword || !confirmPassword
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleReset}
              disabled={!tempPassword || !newPassword || !confirmPassword}
              style={{ 
                backgroundColor: PRIMARY, 
                color: TEXT1 
              }}
            >
              Confirm & Reset
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

export default ResetPassword;