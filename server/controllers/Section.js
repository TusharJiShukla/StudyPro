const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");

// ==========================================================
// CREATE SECTION
// ==========================================================

exports.createSection = async (req, res) => {
  try {
    // ==========================================================
    // DATA FETCH
    // ==========================================================

    const { sectionName, courseId } = req.body;

    // ==========================================================
    // DATA VALIDATION
    // ==========================================================

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Required",
      });
    }

    // ==========================================================
    // CREATE SECTION
    // ==========================================================

    const newSection = await Section.create({
      sectionName,
    });

    // ==========================================================
    // UPDATE COURSE WITH SECTION OBJECT ID
    // ==========================================================

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true },
    )

      // ==========================================================
      // POPULATE COURSE CONTENT (SECTIONS)
      // ==========================================================

      .populate({
        path: "courseContent",

        // ==========================================================
        // POPULATE SUB-SECTIONS INSIDE SECTIONS
        // ==========================================================

        populate: {
          path: "subSection",
        },
      });

    // ==========================================================
    // courseContent stores Section ObjectIds
    // First populate replaces Section IDs with actual Section documents
    // Each Section further contains subSection ObjectIds
    // Nested populate replaces subSection IDs with actual SubSection documents
    // This gives complete course -> section -> subsection data in one query

    // .populate({
    //   path: "courseContent",
    //   populate: {
    //     path: "subSection",
    //   },
    // })
    // ==========================================================

    // ==========================================================
    // RETURN RESPONSE
    // ==========================================================

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    // ==========================================================
    // ERROR RESPONSE
    // ==========================================================

    return res.status(500).json({
      success: false,
      message: "Unable to create Section, please try again",
      error: error.message,
    });
  }
};

// ==========================================================
// UPDATE SECTION
// ==========================================================

exports.updateSection = async (req, res) => {
  try {
    // ==========================================================
    // DATA INPUT
    // ==========================================================

    const { sectionName, sectionId, courseId } = req.body;

    // ==========================================================
    // DATA VALIDATION
    // ==========================================================

    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    // ==========================================================
    // UPDATE DATA
    // ==========================================================

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true },
    );
    console.log("section: ", section);

    const course = await Course.findById(courseId).populate({
      path : "courseContent",
      populate: {
        path : "subSection",
      }
    })
    // ==========================================================
    // RETURN RESPONSE
    // ==========================================================

    return res.status(200).json({
      success: true,
      message: section,
      data : course,
    });
  } catch (error) {
    // ==========================================================
    // ERROR RESPONSE
    // ==========================================================

    return res.status(500).json({
      success: false,
      message: "Unable to update Section, please try again",
      error: error.message,
    });
  }
};


// ==========================================================
// DELETE SECTION
exports.deleteSection = async (req, res) => {
  try {

    // ==========================================================
    // FETCH DATA FROM PARAMS
    // ==========================================================

    const { courseId, sectionId } = req.body;

    // ==========================================================
    // VALIDATION
    // ==========================================================

    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Section ID and Course ID are required",
      });
    }

    // ==========================================================
    // DELETE SECTION REFERENCE FROM COURSE
    // ==========================================================

    await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: {
          courseContent: sectionId,
        },
      },
      { new: true }
    );

    // ==========================================================
    // FIND THE SECTION DETAILS
    // ==========================================================

    const section = await Section.findById(sectionId);

    // ==========================================================
    // DELETE ALL SUBSECTIONS INSIDE SECTION
    // ==========================================================

    if (section && section.subSection && section.subSection.length > 0) {

      await SubSection.deleteMany({
        _id: {
          $in: section.subSection,
        },
      });

    }

    // ==========================================================
    // DELETE SECTION
    // ==========================================================

    await Section.findByIdAndDelete(sectionId);

    // ==========================================================
    // RETURN UPDATED COURSE DATA
    // ==========================================================
    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: {
        path: "subSection"
      }
    });

    // ==========================================================
    // RETURN RESPONSE
    // ==========================================================

    return res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
      data: course,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete section",
      error: error.message,
    });
  }
};