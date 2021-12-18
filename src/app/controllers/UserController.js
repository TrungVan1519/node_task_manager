const User = require("../models/User.js");
const sharp = require("sharp");
const multer = require("multer");
const upload = multer({
  // storage: multer.diskStorage({
  //   destination(req, file, cb) {
  //     cb(null, "./src/public/avatars");
  //   },
  //   filename(req, file, cb) {
  //     cb(null, Date.now() + "-" + file.originalname);
  //   },
  // }),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("You can only upload image file"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1000000, // 1 MB
  },
}).single("avatar");

class UserController {
  // [POST] /users/
  async signup(req, res, next) {
    try {
      // await User.init(); /* Have to do this stuff if want "unique: true" in User works */
      const user = await User.create(req.body);
      const token = await user.generateAuthToken();

      console.log("Signup successfully.", user);
      res.status(201).json({ user, token });
    } catch (err) {
      console.log("Create user failed.", err.message);
      res.status(400).json({ err: err.message });
    }
  }

  // [POST] /users/login
  async login(req, res, next) {
    try {
      const user = await User.findByCredentials(
        req.body.email,
        req.body.password
      );
      const token = await user.generateAuthToken();

      console.log("Login successfully.");
      res.status(200).json({ user, token });
    } catch (err) {
      console.log("Login failed.", err.message);
      res.status(400).json({ err: err.message });
    }
  }

  // [POST] /users/logout
  async logout(req, res, next) {
    try {
      // Delete token
      req.authenticatedUser.tokens = req.authenticatedUser.tokens.filter(
        (token) => token.token !== req.token
      );
      await req.authenticatedUser.save();

      console.log("Logout successfully.");
      res.status(200).json({ message: "Logout successfully." });
    } catch (err) {
      console.log("Logout failed.", err.message);
      res.status(500).json({ err: err.message });
    }
  }

  // [POST] /users/logoutAll
  async logoutAll(req, res, next) {
    try {
      // Empty tokens array and by this way, we can logout all account
      req.authenticatedUser.tokens = [];
      await req.authenticatedUser.save();

      console.log("Logout all successfully.");
      res.status(200).json({ message: "Logout  all successfully." });
    } catch (err) {
      console.log("Logout all failed.", err.message);
      res.status(500).json({ err: err.message });
    }
  }

  // [GET] /users/me
  async findProfile(req, res, next) {
    console.log(
      "Get profile of authenticated user successfully.",
      req.authenticatedUser
    );
    res.status(200).json(req.authenticatedUser);
  }

  // [PATCH] /users/me
  async updateProfile(req, res, next) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["age", "name", "email", "password"];
    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) {
      return res.status(400).json("Error: Invalid properties.");
    }

    try {
      updates.forEach(
        (update) => (req.authenticatedUser[update] = req.body[update])
      );
      await req.authenticatedUser.save();

      console.log("Update me successfully.", req.authenticatedUser);
      res.status(201).json(req.authenticatedUser);
    } catch (err) {
      console.log("Update me failed.", err.message);
      res.status(400).json({ err: err.message });
    }
  }

  // [DELETE] /users/me
  async deleteProfile(req, res, next) {
    try {
      req.authenticatedUser.remove();
      console.log("Delete me successfully.", req.authenticatedUser);
      res.json(req.authenticatedUser);
    } catch (err) {
      console.log("Delete me failed.", err.message);
      res.status(500).json({ err: err.message });
    }
  }

  // [POST] /users/me/avatar
  async uploadAvatar(req, res, next) {
    upload(req, res, async (err) => {
      if (err) {
        return res.send({ error: err.message });
      }
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      req.authenticatedUser.avatar = buffer;
      await req.authenticatedUser.save();
      res.json({ user: req.authenticatedUser.avatar });
    });
  }

  // [DELETE] /users/me/avatar
  async deleteAvatar(req, res, next) {
    try {
      req.authenticatedUser.avatar = undefined;
      await req.authenticatedUser.save();
      res.json({ user: res.authenticatedUser });
    } catch (err) {}
  }

  // [GET] /users/:id/avatar
  async serveUserAvatar(req, res, next) {
    try {
      const user = await User.findById(req.params.id);
      if (!user || !user.avatar) {
        throw new Error("User not found.");
      }

      // Because we convert image to png automatically, we need to set image/png
      res.set("Content-Type", "image/png");
      res.send(user.avatar);
    } catch (err) {
      console.log("Get user avatar failed.", err.message);
      res.status(500).json({ err: err.message });
    }
  }

  // ----------------------------------------------------
  // Do not use this code below because:
  // + now authenticate mechanism is integrated
  // + authenticated user cannot see all information of others, he only can see his information
  // [GET] /users/
  async findAll(req, res, next) {
    try {
      const users = await User.find({});
      console.log("Find users successfully.", users);
      res.status(200).json(users);
    } catch (err) {
      console.log("Find users failed.", err.message);
      res.status(404).json({ err: err.message });
    }
  }

  // [GET] /users/:id
  async findById(req, res, next) {
    try {
      const user = await User.findById({ _id: req.params.id });
      console.log("Find user successfully.", user);
      res.status(200).json(user);
    } catch (err) {
      console.log("Find user failed.", err.message);
      res.status(404).json({ err: err.message });
    }
  }

  // [PATCH] /users/:id
  async updateSingle(req, res, next) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["age", "name", "email", "password"];
    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) {
      return res.status(400).json("Error updating. Invalid properties");
    }

    try {
      const user = await User.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!user) {
        return res.status(404).json(null);
      }

      console.log("Update user successfully.", user);
      res.status(201).json(user);
    } catch (err) {
      console.log("Update user failed.", err.message);
      res.status(400).json({ err: err.message });
    }
  }

  // [DELETE] /users/:id
  async deleteSingle(req, res, next) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json(null);
      }

      console.log("Delete user successfully.", user);
      res.json(user);
    } catch (err) {
      console.log("Delete user failed.", err.message);
      res.status(500).json({ err: err.message });
    }
  }
}

module.exports = new UserController();
