import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { execPromise } from "../path/to/ffmpegUtils.js";
import {
  CLOUD_THUMBNAIL_FOLDER_NAME,
  CLOUD_VIDEO_FOLDER_NAME,
} from "../constants.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(500, "Please enter title and description");
  }
  const videoLocalPath = req.files?.video[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;
  if (!videoLocalPath) {
    throw new ApiError(400, "videoLocalPath file is requierd before cloud ");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(
      400,
      "thumbnailLocalPath file is requierd before cloud "
    );
  }

  const video = await uploadOnCloudinary(
    videoLocalPath,
    CLOUD_VIDEO_FOLDER_NAME
  );
  const thumbnail = await uploadOnCloudinary(
    thumbnailLocalPath,
    CLOUD_THUMBNAIL_FOLDER_NAME
  );
  if (!video || !thumbnail) {
    throw new ApiError(400, "Error uploading video or thumbnail to Cloudinary");
  }
  const vidocreated = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    title: title.trim(),
    description: description.trim(),
    isPublished: true,
    owner: req.user._id,
    duration: Math.round(video.duration),
  });
  return res
    .status(201)
    .json(new ApiResponse(201, vidocreated, "video is been uploaded "));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "videoId is required or invalid!!");
  }

  let video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
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
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        likes: {
          $size: "$likes",
        },
        views: {
          $add: [1, "$views"],
        },
      },
    },
  ]);
  if (!video) {
    throw new ApiError(400, "video not found ");
  }

  if (video.length > 0) {
    video = video[0];
  }
  if (video.length > 0) {
    video = video[0];
  }

  await Video.findByIdAndUpdate(videoId, {
    $set: {
      views: video.views,
    },
  });

  res.status(200).json(new ApiResponse(200, video, "Get single video success"));
});

export { publishAVideo ,getVideoById};
