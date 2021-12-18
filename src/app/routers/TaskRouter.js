const express = require("express");
const router = express.Router();
const taskController = require("../controllers/TaskController.js");
const auth = require("../middlewares/AuthMiddleware.js");

router.get("/me", auth, taskController.findAllTasks);
router.get("/me/:id", auth, taskController.findByIdTask);
router.post("/me", auth, taskController.createSingleTask);
router.patch("/me/:id", auth, taskController.updateSingleTask);
router.delete("/me/:id", auth, taskController.deleteSingleTask);

router.get("/", taskController.findAll);
router.get("/:id", taskController.findById);
router.post("/", taskController.createSingle);
router.patch("/:id", taskController.updateSingle);
router.delete("/:id", taskController.deleteSingle);

module.exports = router;
