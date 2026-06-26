const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const CourseProgress  = require("../models/CourseProgress"); 
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
// ==========================================
// CREATE COURSE HANDLER FUNCTION
// ==========================================

exports.createCourse = async (req, res) => {
  try {
    // FETCH DATA
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;

    // ==========================================
    // GET THUMBNAIL
    // ==========================================
    console.log("REQ BODY:", req.body);
    console.log("REQ FILES:", req.files);
    console.log("REQ USER:", req.user);
    const thumbnail = req.files.thumbnailImage;

    // ==========================================
    // VALIDATION
    // ==========================================

    console.log(
      "courseName:: ",
      courseName,
      "courseDescription:: ",
      courseDescription,
      "whatYouWillLearn:: ",
      whatYouWillLearn,
      price,
      category,
      thumbnail,
    );

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ==========================================
    // CHECK FOR INSTRUCTOR
    // ==========================================

    const userId = req.user.id;

    const instructorDetails = await User.findById(userId);

    console.log("Instructor Details:", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details not found",
      });
    }

    // ==========================================
    // CHECK GIVEN Category IS VALID OR NOT
    // ==========================================

    const categoryDetails = await Category.findById(category);

    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details not found",
      });
    }

    // ==========================================
    // UPLOAD IMAGE TO CLOUDINARY
    // ==========================================

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME,
    );

    // ==========================================
    // CREATE ENTRY FOR NEW COURSE
    // ==========================================

    const updatedCourse = await Course.create({
      courseName,

      courseDescription,

      instructor: instructorDetails._id,

      whatYouWillLearn: whatYouWillLearn,

      price,

      category: categoryDetails._id,

      thumbnail: thumbnailImage.secure_url,
    });

    // ==========================================
    // ADD NEW COURSE TO USER SCHEMA
    // ==========================================

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },

      {
        $push: {
          courses: updatedCourse._id,
        },
      },

      { new: true },
    );

    // ==========================================
    // UPDATE Category SCHEMA
    // ==========================================

    await Category.findByIdAndUpdate(
      { _id: categoryDetails._id },

      {
        $push: {
          course: updatedCourse._id,
        },
      },

      { new: true },
    );

    // ==========================================
    // RETURN RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      data: updatedCourse,
    });
  } catch (error) {
    // ==========================================
    // ERROR HANDLING
    // ==========================================

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL COURSES HANDLER FUNCTION
// ==========================================
// Edit Course Details
// ==========================================

exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ 
        success: false,
        error: "Course not found" 
      });
    }

    // If Thumbnail Image is found, update it
    if (req.files && req.files.thumbnailImage) {
      console.log("thumbnail update");
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    // ✅ FIX: Update fields manually instead of iterating over hasOwnProperty
    if (req.body.courseName) {
      course.courseName = req.body.courseName;
    }
    
    if (req.body.courseDescription) {
      course.courseDescription = req.body.courseDescription;
    }
    
    if (req.body.whatYouWillLearn) {
      course.whatYouWillLearn = req.body.whatYouWillLearn;
    }
    
    if (req.body.price) {
      course.price = req.body.price;
    }
    
    if (req.body.category) {
      course.category = req.body.category;
    }
    
    if (req.body.status) {
      course.status = req.body.status;
    }
    
    // Handle tag field (might be JSON string)
    if (req.body.tag) {
      try {
        course.tag = typeof req.body.tag === 'string' 
          ? JSON.parse(req.body.tag) 
          : req.body.tag;
      } catch (e) {
        course.tag = req.body.tag;
      }
    }
    
    // Handle instructions field (might be JSON string)
    if (req.body.instructions) {
      try {
        course.instructions = typeof req.body.instructions === 'string' 
          ? JSON.parse(req.body.instructions) 
          : req.body.instructions;
      } catch (e) {
        course.instructions = req.body.instructions;
      }
    }

    await course.save();

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
    
  } catch (error) {
    console.error("EDIT COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec()

    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}
// Get One Single Course Details
// exports.getCourseDetails = async (req, res) => {
//   try {
//     const { courseId } = req.body
//     const courseDetails = await Course.findOne({
//       _id: courseId,
//     })
//       .populate({
//         path: "instructor",
//         populate: {
//           path: "additionalDetails",
//         },
//       })
//       .populate("category")
//       .populate("ratingAndReviews")
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec()
//     // console.log(
//     //   "###################################### course details : ",
//     //   courseDetails,
//     //   courseId
//     // );
//     if (!courseDetails || !courseDetails.length) {
//       return res.status(400).json({
//         success: false,
//         message: `Could not find course with id: ${courseId}`,
//       })
//     }

//     if (courseDetails.status === "Draft") {
//       return res.status(403).json({
//         success: false,
//         message: `Accessing a draft course is forbidden`,
//       })
//     }

//     return res.status(200).json({
//       success: true,
//       data: courseDetails,
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id
    console.log(instructorId);
    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })
    console.log("instructor courses: ", instructorCourses);
    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    console.log(courseId);
    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    console.log(course);
    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }
      // Delete the section
      await Section.findByIdAndDelete(sectionId)

    }

      console.log("about to delete");
    // Delete the course
    await Course.findByIdAndDelete(courseId)
console.log("deleted");
    // Delete the course
    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}