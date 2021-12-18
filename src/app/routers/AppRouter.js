const userRouter = require("./UserRouter.js");
const taskRouter = require("./TaskRouter.js");

module.exports = function route(app) {
  app.use("/users", userRouter);
  app.use("/tasks", taskRouter);
};
