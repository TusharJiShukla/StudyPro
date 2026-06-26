import React, { useState, useEffect } from 'react'
import OTPInput from 'react-otp-input'
import { useDispatch } from 'react-redux'
import { signUp, sendOtp } from '../services/operations/authAPI'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const VerifyEmail = () => {
  const [otp, setOtp] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { signupData, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!signupData) {
      navigate('/signup')
    }
  }, [navigate, signupData])

  const handleOnSubmit = (e) => {
    e.preventDefault()
    
    const {
      accountType,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = signupData

    dispatch(signUp(accountType, firstName, lastName, email, password, confirmPassword, otp, navigate))
  }

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center px-4">
      {loading ? (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-50 border-r-transparent"></div>
          <p className="mt-2 text-richblack-200">Loading...</p>
        </div>
      ) : (
        <div className="w-full max-w-md rounded-lg bg-richblack-800 p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Verify Email
          </h1>
          <p className="text-richblack-300 text-center mb-6">
            A verification code has been sent to you. Enter the code below
          </p>
          
          <form onSubmit={handleOnSubmit} className="space-y-6">
            <div className="flex justify-center">
              <OTPInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="!w-12 !h-12 mx-1 text-center text-xl font-semibold bg-richblack-700 text-white border border-richblack-600 rounded-md focus:outline-none focus:border-yellow-50 focus:ring-1 focus:ring-yellow-50"
                  />
                )}
                containerStyle="flex justify-center"
              />
            </div>
            
            <button
              type="submit"
              className="w-full rounded-md bg-yellow-50 py-3 font-semibold text-black transition-all duration-200 hover:scale-95"
            >
              Verify Email
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-3">
            <Link to="/login">
              <button className="text-richblack-300 hover:text-yellow-50 transition-colors duration-200">
                Back to Login
              </button>
            </Link>
            
            <div>
              <button
                onClick={() => dispatch(sendOtp(signupData.email))}
                className="text-richblack-300 hover:text-yellow-50 transition-colors duration-200 text-sm"
              >
                Resend it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerifyEmail