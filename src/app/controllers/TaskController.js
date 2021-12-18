const Task = require("../models/Task.js");

class TaskController {
  // [POST] /tasks/me
  async createSingleTask(req, res, next) {
    try {
      const task = await Task.create({
        ...req.body,
        owner: req.authenticatedUser._id,
      });
      console.log("Create task successfully.", task);
      res.status(201).json(task);
    } catch (err) {
      console.log("Create task failed.", err.message);
      res.status(400).json({ err: err.message });
    }
  }

  // [GET] /tasks/me/:id
  async findByIdTask(req, res, next) {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        owner: req.authenticatedUser._id,
      });

      if (!task) {
        return res.status(404).json(null);
      }

      console.log("Find task successfully.", task);
      res.status(200).json(task);
    } catch (err) {
      console.log("Find task failed.", err.message);
      res.status(404).json({ err: err.message });
    }
  }

  // [GET] /tasks/me + [?completed=true|false]
  // [GET] /tasks/me?limit=10&skip=0 ~ result = limit*skip
  // [GET] /tasks/me?sortBy=createdAt_desc
  async findAllTasks(req, res, next) {
    try {
      // // Cach 1: Truy van nhu binh thuong hay dung
      // const tasks = await Task.find({ owner: req.authenticatedUser._id });
      // res.status(200).json(tasks);

      // Cach 2: Su dung virtual props trong User Model da tao truoc do
      const match = {};
      const sort = {};

      if (req.query.completed) {
        match.completed = req.query.completed === "true";
      }

      if (req.query.sortBy) {
        const parts = req.query.sortBy.split("_");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
      }

      await req.authenticatedUser
        .populate({
          path: "tasks",
          match,
          options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort,
          },
        })
        .execPopulate();
      console.log("Find tasks successfully.", req.authenticatedUser.tasks);
      res.status(200).json(req.authenticatedUser.tasks);
    } catch (err) {
      console.log("Find tasks failed.", err.message);
      res.status(404).json({ err: err.message });
    }
  }

  // [PATCH] /tasks/me/:id
  async updateSingleTask(req, res, next) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["completed", "description"];
    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) {
      return res.status(400).send("Error: Invalid properties.");
    }

    try {
      const task = await Task.findOne({
        _id: req.params.id,
        owner: req.authenticatedUser._id,
      });

      if (!task) {
        return res.status(404).json(null);
      }

      updates.forEach((update) => (task[update] = req.body[update]));
      await task.save();

      console.log("Update task successfully.", task);
      res.status(201).json(task);
    } catch (err) {
      console.log("Update task failed.", err.message);
      res.status(400).json({ err: err.message });
    }
  }

  // [DELETE] /tasks/:id
  async deleteSingleTask(req, res, next) {
    try {
      const task = await Task.findOneAndDelete({
        _id: req.params.id,
        owner: req.authenticatedUser._id,
      });

      if (!task) {
        return res.status(404).json(null);
      }

      console.log("Delete task successfully.", task);
      res.json(task);
    } catch (err) {
      console.log("Delete task failed.", err.message);
      res.status(500).json({ err: err.message });
    }
  }

  // ----------------------------------------------------
  // Do not use this code below because:
  // + now authenticate mechanism is integrated
  // + authenticated user cannot see all information of others, he only can see his information
  // [GET] /tasks/
  async findAll(req, res, next) {
    try {
      const tasks = await Task.find({});
      console.log("Find tasks successfully.", tasks);
      res.status(200).json(tasks);
    } catch (err) {
      console.log("Find tasks failed.", err.message);
      res.status(404).json({ err: err.message });
    }
  }

  // [GET] /tasks/:id
  async findById(req, res, next) {
    try {
      const task = await Task.findById({ _id: req.params.id });
      console.log("Find task successfully.", task);
      res.status(200).json(task);
    } catch (err) {
      console.log("Find task failed.", err.message);
      res.status(404).json({ err: err.message });
    }
  }

  // [POST] /tasks/
  async createSingle(req, res, next) {
    try {
      const task = await Task.create(req.body);
      console.log("Create task successfully.", task);
      res.status(201).json(task);
    } catch (err) {
      console.log("Create task failed.", err.message);
      res.status(400).json({ err: err.message });
    }
  }

  // [PATCH] /tasks/:id
  async updateSingle(req, res, next) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["completed", "description"];
    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) {
      return res.status(400).send("Error: Invalid properties");
    }

    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!task) {
        return res.status(404).json(null);
      }

      console.log("Update task successfully.", task);
      res.status(201).json(task);
    } catch (err) {
      console.log("Update task failed.", err.message);
      res.status(400).json({ err: err.message });
    }
  }

  // [DELETE] /tasks/:id
  async deleteSingle(req, res, next) {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);

      if (!task) {
        return res.status(404).json(null);
      }

      console.log("Delete task successfully.", task);
      res.json(task);
    } catch (err) {
      console.log("Delete task failed.", err.message);
      res.status(500).json({ err: err.message });
    }
  }
}

module.exports = new TaskController();
