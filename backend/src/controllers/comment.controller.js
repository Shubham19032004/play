import mongoose from "mongoose";
import { Comment, comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId?.trim() || !isValidObjectId(videoId)) {
    throw new ApiError(400, "videoId is required or invalid");
  }
  page = isNaN(page) ? 1 : Number(page);
  limit = isNaN(limit) ? 10 : Number(limit);
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    page = 10;
  }
  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "commentedBy",
        foreignField: "_id",
        as: "commentedBy",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        commentedBy: {
          $first: "$commentedBy",
        },
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, comments, "Get video comments success"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  if (!videoId?.trim() || !isValidObjectId(videoId)) {
    throw new ApiError(400, "videoId is required or invalid");
  }

  const content = req.body?.content?.trim();
  if (!content) {
    throw new ApiError(400, "Comment text is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found to comment");
  }
  const comentCreate = await Comment.crate({
    owner: req.user._id,
    content: comment,
    video: video._id,
  });
  res.status(200, comentCreate, "comment is been create successfully");
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  // TODO: update a comment
  if (!commentId.trim()) {
    throw new ApiError(400, "commendId not found");
  }
  const content = req.body?.content;
  if (!content.trim()) {
    throw new ApiError(400, "comment nor found ");
  }
  const comment = Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Commend on video is updated "));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "comment does not exist");
  }
  const deleted = comment.findByIdAndDelete(commentId);
  if (!deleted) {
    throw new ApiError(400, "comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "video is been deletd"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
