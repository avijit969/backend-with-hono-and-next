import {
  acceptedInvite,
  addMember,
  createTrip,
  deleteTrip,
  getAllTrips,
  getTrip,
  removeMember,
  updateTrip,
} from "@/controllers/trip.controller";
import { connectDB } from "@/db";
import { verifyJwt } from "@/helpers/verifyJwt";
import { Hono } from "hono";

const tripRoter = new Hono();
connectDB();
tripRoter.post("/create-trip", verifyJwt, createTrip);
tripRoter.get("/get-trip/:id", verifyJwt, getTrip);
tripRoter.get("/get-all-trips", verifyJwt, getAllTrips);
tripRoter.patch("/update-trip/:id", verifyJwt, updateTrip);
tripRoter.delete("/delete-trip/:id", verifyJwt, deleteTrip);
tripRoter.post("/add-member/:id", verifyJwt, addMember);
tripRoter.delete("/remove-member/:id", verifyJwt, removeMember);
tripRoter.post("/accepted-invite/:id", verifyJwt, acceptedInvite);
export default tripRoter;
