import mongoose, { Schema } from "mongoose";

const likeSchema = Schema(
  {
    Comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likeBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export const Like=mongoose.model("like",likeSchema)
