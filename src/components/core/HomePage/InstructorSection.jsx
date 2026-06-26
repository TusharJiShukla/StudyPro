import React from "react";
import Instructor from "../../../assets/Images/Instructor.png";
import HighlightText from "./HighlightText";
import CTAButton from "./Button";
import { FaArrowRight } from "react-icons/fa";

const InstructorSection = () => {
  return (
    <div className="mt-16">
      <div className="flex flex-row gap-20 items-center">
        {/* Left */}
        <div className="w-[50%]">
          <img src={Instructor} alt="" className="shadow-white" />
        </div>

        {/* Right */}
        <div className="w-[50%] flex flex-col gap-10">
          <div className="text-4xl font-semibold w-[50%]">
            Become an <HighlightText text={"Instructor"} />
          </div>

          <p className="font-medium text-[16px] text-richblack-300 w-[90%]">
            Instructors from around the world teach millions of students on
            StudyPro. We provide the tools and skills to teach what you love.
          </p>

          <div className="w-fit">
            <CTAButton active={true} linkto={"/signup"}>
              <div className="flex flex-row gap-3 items-center">
                Start Learning Today
                <FaArrowRight />
              </div>
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorSection;
