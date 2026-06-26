import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { changePassword } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../common/IconBtn"

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)  // ✅ Get user data
  const navigate = useNavigate()

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)  // ✅ Add confirm password state

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,  // ✅ Add watch to check password match
  } = useForm()

  const newPassword = watch("newPassword")  // ✅ Watch new password value

  const submitPasswordForm = async (data) => {
    console.log("password Data - ", data)
    
    // ✅ Add email to the data
    const formData = {
      email: user?.email,  // ✅ Add user email
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword,
    }
    
    console.log("FormData being sent:", formData)
    
    try {
      await changePassword(token, formData)
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(submitPasswordForm)}>
        <div className="my-10 flex flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12">
          <h2 className="text-lg font-semibold text-richblack-5">Password</h2>
          <div className="flex flex-col gap-5 lg:flex-row">
            {/* Old Password */}
            <div className="relative flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="oldPassword" className="lable-style">
                Current Password
              </label>
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                id="oldPassword"
                placeholder="Enter Current Password"
                className="form-style"
                {...register("oldPassword", { required: "Current Password is required" })}
              />
              <span
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer"
              >
                {showOldPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                ) : (
                  <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                )}
              </span>
              {errors.oldPassword && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  {errors.oldPassword.message}
                </span>
              )}
            </div>
            
            {/* New Password */}
            <div className="relative flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="newPassword" className="lable-style">
                New Password
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                id="newPassword"
                placeholder="Enter New Password"
                className="form-style"
                {...register("newPassword", { 
                  required: "New Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
              />
              <span
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer"
              >
                {showNewPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                ) : (
                  <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                )}
              </span>
              {errors.newPassword && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  {errors.newPassword.message}
                </span>
              )}
            </div>
          </div>
          
          {/* Confirm New Password */}
          <div className="relative flex flex-col gap-2">
            <label htmlFor="confirmNewPassword" className="lable-style">
              Confirm New Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmNewPassword"
              id="confirmNewPassword"
              placeholder="Confirm New Password"
              className="form-style"
              {...register("confirmNewPassword", { 
                required: "Please confirm your password",
                validate: value => value === newPassword || "Passwords do not match"
              })}
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
            {errors.confirmNewPassword && (
              <span className="-mt-1 text-[12px] text-yellow-100">
                {errors.confirmNewPassword.message}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              navigate("/dashboard/my-profile")
            }}
            className="cursor-pointer rounded-md bg-richblack-700 py-2 px-5 font-semibold text-richblack-50"
          >
            Cancel
          </button>
          <IconBtn type="submit" text="Update" />
        </div>
      </form>
    </>
  )
}