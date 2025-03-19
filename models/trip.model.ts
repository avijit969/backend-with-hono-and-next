import user from "@/routes/user.routes";
import mongoose, { Schema } from "mongoose";

const tripSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Trip = mongoose.models.Trip || mongoose.model("Trip", tripSchema);
