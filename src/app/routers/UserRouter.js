const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController.js");
const auth = require("../middlewares/AuthMiddleware.js");

router.post("/", userController.signup);
router.post("/login", userController.login);
router.post("/logout", auth, userController.logout);
router.post("/logoutAll", auth, userController.logoutAll);
router.get("/me", auth, userController.findProfile);
router.patch("/me", auth, userController.updateProfile);
router.delete("/me", auth, userController.deleteProfile);

router.get("/", userController.findAll);
router.get("/:id", userController.findById);
router.patch("/:id", userController.updateSingle);
router.delete("/:id", userController.deleteSingle);

router.post("/me/avatar", auth, userController.uploadAvatar);
router.delete("/me/avatar", auth, userController.deleteAvatar);
router.get("/:id/avatar", userController.serveUserAvatar);

router.use((err, req, res, next) => {
  res.json(err);
});

module.exports = router;
