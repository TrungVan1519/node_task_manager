const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const chalk = require("chalk");
const Task = require("./Task.js");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: {
      type: Number,
      default: 0,
      validate: {
        validator(value) {
          if (value < 0) {
            throw new Error("Age must be positive number.");
          }
        },
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator(value) {
          if (!validator.isEmail(value)) {
            throw new Error("Email is invalid.");
          }
        },
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate: {
        validator(value) {
          if (validator.contains(value.toLowerCase(), ["password"])) {
            throw new Error("Password cannot contain 'password'.");
          }
        },
      },
    },
    tokens: [{ token: { type: String, required: true } }],
    avatar: { type: Buffer },
  },
  { timestamps: true }
);

// Virtual props, we don't want to store this prop in database but we have to use this for relating to task document
UserSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id" /* is user._id */,
  foreignField: "owner" /* is task.owner */,
  // Select * from tasks where user._id === task.owner
});

// Document's custom methods (Document is an instance of Model)
UserSchema.methods.generateAuthToken = async function () {
  // "this" refers to user Document (user is an instance of User Model)
  const token = jwt.sign({ _id: this._id.toString() }, "authenticatedUser", {
    expiresIn: "7 days",
  });

  this.tokens = this.tokens.concat({ token });
  await this.save();

  return token;
};

// Have to has exact name "toJSON" because toJSON is a built-in function of JS core, it always be called once JSON.stringify() is running
UserSchema.methods.toJSON = function () {
  // "this" refers to user document (instance of User Model)
  const userObject = this.toObject();

  // Hiding sensitive data of authenticated user
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar

  return userObject;
};

// Model's custom methods
UserSchema.statics.findByCredentials = async function (email, password) {
  // "this" refers to User Model
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("User not found.");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Password does not match.");
  }

  return user;
};

// Mongoose Middleware
UserSchema.pre("save", async function (next) {
  // "this" refers to the user document
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 8);
    }
    next();
  } catch (err) {
    console.log(chalk.bold.red("Mongoose Middleware Error.", err.message));
    next(err);
  }
})
  .pre("findOneAndUpdate", async function (next) {
    // "this" refers to Query
    // Use "this.getFilter()" to get id if needed
    try {
      if (this.getUpdate().password) {
        this.getUpdate().password = await bcrypt.hash(
          this.getUpdate().password,
          8
        );
      }
      next();
    } catch (err) {
      console.log(chalk.bold.red("Mongoose Middleware Error.", err.message));
      next(err);
    }
  })
  .pre("remove", async function (next) {
    // "this" refers to the user document
    // Use for cascading delete purpose
    await Task.deleteMany({ owner: this._id });
    next();
  });

module.exports = mongoose.model("User", UserSchema);
