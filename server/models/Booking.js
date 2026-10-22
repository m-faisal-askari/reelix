import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, ref: "User" },
    show: { type: String, required: true, ref: "Show" },
    amount: { type: Number, required: true },
    bookedSeats: { type: Array, required: true },
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String },
  },
  { timestamps: true }
);

// High-performance query indexes
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ show: 1 });
bookingSchema.index({ isPaid: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
