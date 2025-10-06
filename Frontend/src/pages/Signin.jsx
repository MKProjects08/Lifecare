import React, { useState } from "react";
import logo from "../assets/react.svg";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../components/layout/Loading";
import axios from 'axios';

const PRIMARY = "#61dafbaa";
const TEXT1 = "#1F2937";

const SignIn = () => {
  const navigate = useNavigate();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", login: "" });
  const [isLoading, setIsLoading] = useState(false);

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isPasswordValid = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%?&])[A-Za-z\d@#$!%?&]{8,}$/;
    return regex.test(password);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailAddress(value);

    if (value && !emailPattern.test(value)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value && !isPasswordValid(value)) {
      setErrors((prev) => ({
        ...prev,
        password:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const signIn = async (email, password) => {
    if (errors.email || errors.password || !email || !password) return;

    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signin`, {
        email,
        password
      });

      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("username", user.username);
        localStorage.setItem("adminId", user.id);
        localStorage.setItem("role", user.role);

        // Navigate based on role
        if (user.role === 'admin' ) {
          navigate('/dashboard');
        } else if (user.role === 'Worker') {
          navigate('/worker-dashboard');
        } else {
          toast.error("Invalid user role!");
        }
      }
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        login: error.response?.data?.message || "Login failed. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    signIn(emailAddress.trim(), password);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && emailAddress.trim() && password.trim()) {
      handleSignIn();
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="flex items-center justify-center min-h-screen mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-6 w-full max-w-md">
        <img src={logo} alt="App Logo" className="mx-auto p-2" />
        <div>
          <h2 className="text-[TEXT1] text-3xl leading-9 font-extrabold">
            Sign in to your account
          </h2>
        </div>

        {!isLoading ? (
          <div>
            <div className="text-left mb-6">
              <input
                type="text"
                placeholder="Email Address"
                className={`base_input w-full p-2 border rounded-md ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                value={emailAddress}
                onChange={handleEmailChange}
                onKeyDown={handleKeyDown}
              />
              {errors.email && (
                <p className="text-[#e23131] text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="text-left mb-3">
              <input
                type="password"
                placeholder="Password"
                className={`base_input w-full p-2 border rounded-md ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyDown}
                style={{ color: TEXT1 }}
              />
              {errors.password && (
                <p className="text-[#e23131] text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div
              className="self-stretch text-right justify-start text-gray-700 text-base font-medium font-['Inter'] leading-normal cursor-pointer hover:underline"
              onClick={handleForgotPassword}
            >
              Forgotten password
            </div>

            {errors.login && (
              <p className="text-[#e23131] text-sm mt-1 text-left">
                {errors.login}
              </p>
            )}

            <button
              className={`rounded-md p-4 w-full mt-6 font-medium ${
                !emailAddress || !password
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleSignIn}
              disabled={!emailAddress || !password}
              style={{ 
                backgroundColor: PRIMARY, 
                color: TEXT1 
              }}
            >
              Sign In
            </button>
          </div>
        ) : (
          <Loading />
        )}
        <ToastContainer
          position="top-right"
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

export default SignIn;