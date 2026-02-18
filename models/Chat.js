import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: String,
    bot: String,
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
