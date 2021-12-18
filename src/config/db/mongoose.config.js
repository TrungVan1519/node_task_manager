const mongoose = require("mongoose");
const chalk = require("chalk");

module.exports = function connectDatabase() {
  mongoose
    .connect("mongodb://127.0.0.1:27017/task_manager_app", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      // autoIndex: true, /* Have to do this stuff unless await User.init(); */
    })
    .then(() => console.log(chalk.bold.green("Connect database successfully.")))
    .catch((err) => console.log(chalk.bold.red("Connect fail.", err)));
};
