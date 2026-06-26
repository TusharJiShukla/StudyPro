const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");


// createRating
exports.createRating = async (req, res) => {
  try {

    // get data
    const userId = req.user.id;
    const { rating, review, courseId } = req.body;

    // check enrollment
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in course",
      });
    }

    // check existing review
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course already reviewed",
      });
    }

    // create review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      user: userId,
      course: courseId,
    });

    // push review into course
    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );

    // return response
    return res.status(200).json({
      success: true,
      message: "Rating and review created",
      ratingReview,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// getAverageRating
exports.getAverageRating = async (req, res) => {
  try {

    // get course id
    const courseId = req.body.courseId;

    // calculate average
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // return average
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    // no reviews
    return res.status(200).json({
      success: true,
      message: "No ratings found",
      averageRating: 0,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// getAllRating
exports.getAllRating = async (req, res) => {
  try {

    // fetch all reviews
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    // return response
    return res.status(200).json({
      success: true,
      message: "All reviews fetched",
      data: allReviews,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};