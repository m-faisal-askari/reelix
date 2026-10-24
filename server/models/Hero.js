import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Avengers:\nDoomsday" },
    image: {
      type: String,
      default: "/Avengers-Doomsday-All-Teasers-Our-Theories-Marvel-MCU.jpg",
    },
    logo: { type: String, default: "" },
    overview: {
      type: String,
      default:
        "Heroes from three different worlds must unite when they're thrust together to confront a catastrophic danger that could destroy everything they know.",
    },
    runtime: { type: String, default: "2h 34m" },
    releaseYear: { type: String, default: "2026" },
    genres: { type: String, default: "Action | Adventure | Sci-Fi" },
    buttonText: { type: String, default: "Explore Movies" },
    buttonLink: { type: String, default: "/movies" },
  },
  { timestamps: true }
);

const Hero = mongoose.model("Hero", heroSchema);

export default Hero;
