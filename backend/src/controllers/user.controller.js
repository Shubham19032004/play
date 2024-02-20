import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/coludnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  const user = {
    username: req.body.username.toLowerCase(),
    email: req.body.email,
    fullname: req.body.fullname,
    password: req.body.password,
    avatar: null,
    coverImage: null,
  };

  if (
    [user.fullname, user.email, user.password, user.username].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username: user.username }, { email: user.email }],
  });

  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar not found");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  user.avatar = avatar.url;
  user.coverImage = coverImage.url || "";
  if (!avatar) {
    throw ApiError(400, "avatar not found");
  }
  const userCreated = await User.create(user);
  const createdUser = await userCreated
    .findById(user._id)
    .select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Error in creating user");
  }
  return res.status(200).json(
    new ApiResponse(200,createdUser,"User Registed Successfully")
  )


});

export { registerUser };
