import React from "react"
import CTAButton from "./Button"
import { TypeAnimation } from "react-type-animation"
import { FaArrowRight } from "react-icons/fa"

const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeblock,
  codeColor,
}) => {
  return (
    <div className={`flex ${position} my-20 justify-between gap-10 flex-col lg:flex-row`}>

      {/* Left Section */}
      <div className="w-[100%] lg:w-[50%] flex flex-col gap-8">

        {heading}

        <div className="text-richblack-300 text-base font-bold w-[85%]">
          {subheading}
        </div>

        {/* Buttons */}
        <div className="flex gap-7 mt-7">

          <CTAButton active={ctabtn1.active} linkto={ctabtn1.linkto}>
            <div className="flex items-center gap-2">
              {ctabtn1.btnText}
              <FaArrowRight />
            </div>
          </CTAButton>

          <CTAButton active={ctabtn2.active} linkto={ctabtn2.linkto}>
            {ctabtn2.btnText}
          </CTAButton>

        </div>

      </div>

      {/* Right Code Section */}
      <div className="h-fit flex flex-row text-[10px] sm:text-sm leading-6 w-[100%] lg:w-[500px] border border-richblack-700 bg-richblack-800">

        {/* Line Numbers */}
        <div className="text-center flex flex-col w-[10%] text-richblack-400 font-bold font-inter py-2">

          <p>1</p>
          <p>2</p>
          <p>3</p>
          <p>4</p>
          <p>5</p>
          <p>6</p>
          <p>7</p>
          <p>8</p>
          <p>9</p>
          <p>10</p>
          <p>11</p>

        </div>

        {/* Animated Code */}
        <div className={`w-[90%] flex flex-col gap-2 font-bold font-mono py-2 pr-2 ${codeColor}`}>

          <TypeAnimation
            sequence={[codeblock, 2000, ""]}
            repeat={Infinity}
            cursor={true}
            omitDeletionAnimation={true}
            style={{
              whiteSpace: "pre-line",
              display: "block",
            }}
          />

        </div>

      </div>

    </div>
  )
}

export default CodeBlocks