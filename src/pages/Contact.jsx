import React from "react"

import Footer from "../components/common/Footer"
import ReviewSlider from "../components/common/ReviewSlider"
import ContactFormSection from "../components/core/AboutPage/ContactFormSection"

const Contact = () => {
  return (
    <div>
      <div className="mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white lg:flex-row">
        {/* Contact Details / Left side could go here in future */}
        <div className="lg:w-[40%] rounded-xl border border-richblack-600 bg-richblack-800 p-8 lg:p-14">
          <h1 className="text-4xl leading-10 font-semibold text-richblack-5">
            Chat on us
          </h1>
          <p className="mt-2 text-richblack-300">
            Our friendly team is here to help.
          </p>
          <div className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col gap-[2px] text-richblack-200">
              <h2 className="text-lg font-semibold text-richblack-5">
                Visit us
              </h2>
              <p>Come and say hello at our office HQ.</p>
              <p className="font-semibold text-richblack-100">
                123/45, Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-516016
              </p>
            </div>
            <div className="flex flex-col gap-[2px] text-richblack-200">
              <h2 className="text-lg font-semibold text-richblack-5">Call us</h2>
              <p>Mon - Fri From 8am to 5pm</p>
              <p className="font-semibold text-richblack-100">+123 456 7869</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:w-[60%] border border-richblack-600 rounded-xl p-7 lg:p-14">
          <ContactFormSection />
        </div>
      </div>
      <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
        {/* Reviws from Other Learner */}
        <h1 className="text-center text-4xl font-semibold mt-8">
          Reviews from other learners
        </h1>
        <ReviewSlider />
      </div>
      <Footer />
    </div>
  )
}

export default Contact
