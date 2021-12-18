const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Task",
  new mongoose.Schema(
    {
      description: {
        type: String,
        required: true,
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User" /* Built-in helper function, refer to "User" Model */,
      },
    },
    { timestamps: true }
  )
);
