import httpStatus from 'http-status';
import { IReview } from './review.interface';
import { ReviewModel } from './review.model';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';


// Create Reviews
const createReviewServices = async (review: IReview) => {
  // const isReviewExists = await ReviewModel.findOne({ name: review.review_link })
  // if (isReviewExists) {
  //   throw new AppError(httpStatus.CONFLICT, 'This review is already exists!');
  // }

  // (Logic will go here) User can review any product only if he ordered and purchased it

  const result = await ReviewModel.create(review)
  return result
};

// Find Reviews
const findReviewsServices = async (queryParams: Record<string, unknown>) => {
  const initialQuary: any = {
    review_status: "active",
  }
  if (queryParams?.review_product_id) {
    initialQuary.review_product_id = queryParams.review_product_id;
  }

  const modelQuery = ReviewModel.find(initialQuary).sort({ review_serial: 1 }) // Initial Mongoose query

  const query = new QueryBuilder(modelQuery, queryParams)
    .search(['review_link']) // Provide searchable fields
    // .filter()
    .sort()
    .paginate()
  // .fields();

  const result = await query.modelQuery; // Execute the query
  // const result = await query.modelQuery.sort({ sequence: 1 }); // Execute the query
  return result;
};

// find all dashboard Reviews
export const findAllDashboardReviewServices = async (queryParams: Record<string, unknown>) => {
  // const modelQuery = ReviewModel.find().sort({ review_serial: 1 })
  //   .populate('review_user_id review_product_id')

  // const query = new QueryBuilder(modelQuery, queryParams)
  //   .search(['review_user_id.user_phone', 'review_product_id.product_name']) // Provide searchable fields
  //   // .filter()
  //   .sort()
  //   .paginate()
  // // .fields();

  // const result = await query.modelQuery; // Execute the query
  // return result;
  const { searchTerm } = queryParams;
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 20;
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    {
      $lookup: {
        from: 'users',
        localField: 'review_user_id',
        foreignField: '_id',
        as: 'review_user_id'
      }
    },
    {
      $unwind: '$review_user_id'
    },
    {
      $lookup: {
        from: 'products',
        localField: 'review_product_id',
        foreignField: '_id',
        as: 'review_product_id'
      }
    },
    {
      $unwind: '$review_product_id'
    },
    {
      $sort: { review_serial: 1 }
    }
  ];

  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { 'review_user_id.user_phone': { $regex: searchTerm, $options: 'i' } },
          { 'review_product_id.product_name': { $regex: searchTerm, $options: 'i' } },
          { review_link: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    });
  }

  // Add pagination
  pipeline.push({ $skip: skip }, { $limit: limit });

  const result = await ReviewModel.aggregate(pipeline);
  return result;
};

// find reviews by product id
const findReviewsByProductIdServices = async (review_product_id: string) => {
  const reviews = await ReviewModel.find({ review_product_id }).populate('review_user_id').lean();

  const totalReviews = reviews.length;
  const ratingCounts = [0, 0, 0, 0, 0]; // index 0 => 1 star, index 4 => 5 star

  let totalRating = 0;
  for (const review of reviews) {
    const rating = review.review_rating;
    totalRating += rating;
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1]++;
    }
  }

  const averageRating = totalReviews ? (totalRating / totalReviews).toFixed(1) : '0.0';

  return {
    averageRating: parseFloat(averageRating),
    totalReviews,
    ratingBreakdown: ratingCounts, // [1★, 2★, 3★, 4★, 5★]
    reviews,
  };
};

// Update Reviews
const updateReviewServices = async (review: IReview, _id: string): Promise<IReview | any> => {
  const updateReviewInfo = await ReviewModel.findOne({ _id: _id });
  if (!updateReviewInfo) {
    return {};
  }
  const Brand = await ReviewModel.findByIdAndUpdate({ _id: _id },
    { $set: review }, // ✅ This ensures only provided fields are updated
    { new: true, runValidators: true, context: "query" }
  );
  return Brand;
};

// Delete a Review
export const deleteReviewServices = async (_id: string): Promise<IReview | any> => {
  const updateReviewInfo = await ReviewModel.findOne({ _id: _id });
  if (!updateReviewInfo) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review does not exist!');
  }
  const Review = await ReviewModel.findByIdAndDelete({ _id: _id }
  );
  return Review;
};

export const ReviewService = {
  createReviewServices,
  findReviewsServices,
  findReviewsByProductIdServices,
  updateReviewServices,
  findAllDashboardReviewServices,
  deleteReviewServices
};