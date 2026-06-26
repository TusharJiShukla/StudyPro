const mongoose = require("mongoose")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")


exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body
  const userId = req.user.id

  try {
    // Check if the subsection is valid
    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) {
      return res.status(404).json({ 
        success: false,
        error: "Invalid subsection" 
      })
    }

    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    // ✅ FIX: If course progress doesn't exist, create a new one
    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [subsectionId],  // Add current video as completed
      })
      
      return res.status(200).json({ 
        success: true,
        message: "Course progress created and lecture marked as completed" 
      })
    } 
    
    // If course progress exists, check if the subsection is already completed
    if (courseProgress.completedVideos.includes(subsectionId)) {
      return res.status(400).json({ 
        success: false,
        error: "Subsection already completed" 
      })
    }

    // Push the subsection into the completedVideos array
    courseProgress.completedVideos.push(subsectionId)
    
    // Save the updated course progress
    await courseProgress.save()

    return res.status(200).json({ 
      success: true,
      message: "Course progress updated" 
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();
      
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userId}`,
      });
    }
    
    userDetails = userDetails.toObject();
    
    for (let i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0;
      let SubsectionLength = 0;
      
      for (let j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce(
          (acc, curr) => acc + (parseInt(curr.timeDuration) || 0),
          0,
        );
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds,
        );
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length;
      }
      
      // ✅ FIX: Find course progress with correct userId field
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,  // ✅ Use userId field
      });
      
      const completedVideosCount = courseProgressCount?.completedVideos?.length || 0;
      
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 0;
      } else {
        const multiplier = Math.pow(10, 2);
        userDetails.courses[i].progressPercentage =
          Math.round(
            (completedVideosCount / SubsectionLength) * 100 * multiplier,
          ) / multiplier;
      }
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    console.error("GET ENROLLED COURSES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};