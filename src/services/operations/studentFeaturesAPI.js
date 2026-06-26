// src/services/operations/studentFeaturesAPI.js

import toast from "react-hot-toast";

import { apiConnector } from "../apiConnector";

import { studentEndpoints } from "../apis";

import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

import rzpLogo from "../../assets/Logo/rzp_logo.png";

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints;

// UPDATE
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");

    script.src = src;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

// UPDATE
export async function buyCourse(
  token,
  courses,
  userDetails,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Loading...")

  try {
    // load script
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    )

    if (!res) {
      toast.error("RazorPay SDK failed to load")
      return
    }

    // initiate the order
    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      { courses },
      { Authorization: `Bearer ${token}` }
    )

    console.log("PRINTING orderResponse", orderResponse)

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message)
    }

    // ✅ FIX: Access data correctly
    const paymentData = orderResponse.data.data

    // options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,  // ✅ Vite env variable
      currency: paymentData.currency,
      amount: `${paymentData.amount}`,
      order_id: paymentData.id,
      name: "StudyPro",
      description: "Thank You for Purchasing the Course",
      image: rzpLogo,
      prefill: {
        name: `${userDetails.firstName} ${userDetails.lastName || ""}`,
        email: userDetails.email,
      },
      handler: function (response) {
        sendPaymentSuccessEmail(
          response,
          paymentData.amount,
          token
        )
        verifyPayment(
          { ...response, courses },
          token,
          navigate,
          dispatch
        )
      },
    }

    const paymentObject = new window.Razorpay(options)
    paymentObject.open()

    paymentObject.on("payment.failed", function (response) {
      toast.error("Oops, payment failed")
      console.log(response.error)
    })
  } catch (error) {
    console.log("PAYMENT API ERROR.....", error)
    toast.error("Could not make Payment")
  }
  toast.dismiss(toastId)
}

// UPDATE
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      },
    );
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR.....", error);
  }
}

// UPDATE
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment...");

  dispatch(setPaymentLoading(true));

  try {
    const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Payment Successful, you are added to the course");

    navigate("/dashboard/enrolled-courses");

    dispatch(resetCart());
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR....", error);

    toast.error("Could not Verify Payment");
  }

  toast.dismiss(toastId);

  dispatch(setPaymentLoading(false));
}
