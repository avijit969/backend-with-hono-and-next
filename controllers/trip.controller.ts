import { Trip } from "@/models/trip.model";
import { User } from "@/models/user.model";
import { uploadOnCloudinary } from "@/utils/cloudinary";
import { Context } from "hono";

const createTrip = async (c: Context) => {
  try {
    const { _id } = c.get("user");
    const user = await User.findById(_id);
    if (!user) {
      return c.json({ message: "User not found", status: 404 }, 404);
    }

    const { title, description, image, startDate, endDate, location } =
      await c.req.parseBody();
    if (!title || !description || !image || !location) {
      return c.json(
        {
          message:
            "All fields like image, title,description,location are required",
          status: 400,
        },
        400
      );
    }
    const tripImageUrl = await uploadOnCloudinary(image as File);

    if (!tripImageUrl) {
      return c.json({ message: "Upload failed", status: 500 }, 500);
    }

    const trip = await Trip.create({
      title,
      description,
      image: tripImageUrl.secure_url,
      location,
      members: [{ user: user._id, status: "accepted" }],
      creator: user._id,
    });

    return c.json(
      {
        message: "Trip created successfully",
        data: trip,
        status: 201,
        success: true,
      },
      201
    );
  } catch (error: any) {
    return c.json({ message: error.message, status: 500 }, 500);
  }
};
const getTrip = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const trip = await Trip.findById({ _id: id })
      .populate("members.user", "-password -createdAt -updatedAt -__v -email")
      .populate("creator", "-password -createdAt -updatedAt -__v -email");

    if (!trip) {
      return c.json({ message: "Trip not found", status: 404 }, 404);
    }
    return c.json({ message: "Trip found successfully", data: trip }, 200);
  } catch (error: any) {
    return c.json({ message: error.message, status: 500 }, 500);
  }
};
const getAllTrips = async (c: Context) => {
  try {
    const { _id } = c.get("user");
    const trips = await Trip.find({ "members.user": _id })
      .populate("creator", "-password -createdAt -updatedAt -__v -email")
      .select("-__v -updatedAt -members")
      .sort({ createdAt: -1 });

    if (!trips.length) {
      return c.json({ message: "Trips not found", status: 404 }, 404);
    }

    return c.json({ message: "Trips found successfully", data: trips }, 200);
  } catch (error: unknown) {
    console.error("Error fetching trips:", error);
    return c.json({ message: "Internal Server Error", status: 500 }, 500);
  }
};

const updateTrip = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const { title, description, image, location } = await c.req.parseBody();
    if (!title && !description && !image && !location) {
      return c.json({ message: "No fields to update", status: 400 }, 400);
    }
    const trip = await Trip.findById({ _id: id });
    if (!trip) {
      return c.json({ message: "Trip not found", status: 404 }, 404);
    }
    if (title) trip.title = title;
    if (description) trip.description = description;
    if (image) {
      const imageUrl = await uploadOnCloudinary(image as File);
      if (!imageUrl) {
        return c.json({ message: "Upload failed", status: 500 }, 500);
      }
      trip.image = imageUrl.secure_url;
    }
    if (location) trip.location = location;
    await trip.save();
    return c.json({ message: "Trip updated successfully", data: trip }, 200);
  } catch (error: any) {
    return c.json({ message: error.message, status: 500 }, 500);
  }
};
const deleteTrip = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const trip = await Trip.findByIdAndDelete({ _id: id });
    if (!trip) {
      return c.json({ message: "Trip not found", status: 404 }, 404);
    }
    return c.json({ message: "Trip deleted successfully", data: trip }, 200);
  } catch (error: any) {
    return c.json({ message: error.message, status: 500 }, 500);
  }
};

const addMember = async (c: Context) => {
  try {
    const { _id } = c.get("user");
    const id = c.req.param("id");
    const trip = await Trip.findById({ _id: id });
    if (!trip) {
      return c.json({ message: "Trip not found", status: 404 }, 404);
    }
    const user = await User.findById({ _id });
    if (!user) {
      return c.json({ message: "User not found", status: 404 }, 404);
    }
    trip.members.push({ user: user._id, status: "pending" });
    // TODO : send notification to user in email and app push notification
    await trip.save();
    return c.json({ message: "Member added successfully", data: trip }, 200);
  } catch (error: any) {
    return c.json({ message: error.message, status: 500 }, 500);
  }
};
const removeMember = async (c: Context) => {
  try {
    const { _id } = c.get("user");
    const id = c.req.param("id");
    const trip = await Trip.findById({ _id: id });
    if (!trip) {
      return c.json({ message: "Trip not found", status: 404 }, 404);
    }
    const user = await User.findById({ _id });
    if (!user) {
      return c.json({ message: "User not found", status: 404 }, 404);
    }
    const member = trip.members.find(
      (m: any) => m.user.toString() === user._id
    );
    if (!member) {
      return c.json({ message: "Member not found", status: 404 }, 404);
    }
    trip.members.pull({ user: user._id });
    await trip.save();
    return c.json({ message: "Member removed successfully", data: {} }, 200);
  } catch (error: any) {
    return c.json({ message: error.message, status: 500 }, 500);
  }
};
const acceptedInvite = async (c: Context) => {
  try {
    const { _id } = c.get("user");
    const id = c.req.param("id");
    const trip = await Trip.findById({ _id: id });
    if (!trip) {
      return c.json({ message: "Trip not found", status: 404 }, 404);
    }
    const user = await User.findById({ _id });
    if (!user) {
      return c.json({ message: "User not found", status: 404 }, 404);
    }
    trip.members.pull({ user: user._id });
    trip.members.push({ user: user._id, status: "accepted" });
    await trip.save();
    return c.json({ message: "Invite accepted successfully", data: {} }, 200);
  } catch (error: any) {
    return c.json({ message: error.message, status: 500 }, 500);
  }
};
export {
  createTrip,
  getTrip,
  updateTrip,
  deleteTrip,
  getAllTrips,
  addMember,
  removeMember,
  acceptedInvite,
};
