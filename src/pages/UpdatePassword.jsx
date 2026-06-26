import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/operations/authAPI";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const UpdatePassword = () => {
  // ========== REDUX HOOKS ==========
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get loading state from Redux auth slice
  const { loading } = useSelector((state) => state.auth);

  // ========== STATE VARIABLES ==========
  // Form data state
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Toggle password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Destructure form data for easy access
  const { password, confirmPassword } = formData;

  // ========== HANDLER FUNCTIONS ==========
  // Handle input changes
  const handleOnChange = (e) => {
    setFormData({
      ...formData, // Keep previous data
      [e.target.name]: e.target.value, // Update changed field
    });
  };

  // Handle form submission
  const handleOnSubmit = (e) => {
    e.preventDefault(); // Prevent page reload

    // Get token from URL if present (for password reset flow)
    const token = location.pathname.split("/").at(-1);

    // Dispatch reset password action
    dispatch(resetPassword(password, confirmPassword, token, navigate));
  };

  // ========== RENDER COMPONENT ==========
  // Show loading spinner while processing
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Main form UI
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-richblack-800 p-8 shadow-lg">
        {/* Heading Section */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Choose new Password
        </h1>
        <p className="text-richblack-300 mb-6">
          Almost done. Enter your new password and you're all set.
        </p>

        {/* Password Reset Form */}
        <form onSubmit={handleOnSubmit} className="space-y-5">
          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-richblack-200 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Enter new password"
                className="w-full rounded-md bg-richblack-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-50"
              />
              {/* Toggle Password Visibility Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-richblack-300"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-richblack-200 mb-1">
              Confirm Password
            <div className="relative">
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleOnChange}
                placeholder="Confirm new password"
                className="w-full rounded-md bg-richblack-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-50"
              />
              {/* Toggle Confirm Password Visibility */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-richblack-300"
              >
                {showConfirmPassword ? (
                  <AiFillEyeInvisible fontSize={24} />
                ) : (
                  <AiFillEye fontSize={24} />
                )}
              </button>
            </div>
            
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-yellow-50 py-3 font-semibold text-black transition-all duration-200 hover:scale-95"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
