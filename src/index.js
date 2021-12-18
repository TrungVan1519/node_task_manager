const express = require("express");
const chalk = require("chalk");
const connectDatabase = require("./config/db/mongoose.config.js");
const route = require("./app/routers/AppRouter.js");

const app = express();
app.use(express.json());
// app.use(express.urlencoded());

connectDatabase();
route(app);

app.listen(3000, (err) => {
  if (err) {
    return console.log(chalk.bold.red("Error listening:", err.message));
  }
  console.log(chalk.bold.green("Server is listening"));
});

// const Task = require("./app/models/Task");
// const User = require("./app/models/User");

// async function run() {
//   const user = await User.findById("5fae17db33e2e52ff8785ea2");
//   await user.populate("tasks").execPopulate();
//   console.log(user.tasks);
// }
// run();

// ---------------------------------------------------------------
// function add(first, second) {
//   return new Promise((resolve, reject) => {
//     setTimeout(function () {
//       if (first === undefined || second === undefined) {
//         reject(new Error("Invalid argument"));
//       }
//       resolve(first + second);
//     }, 1000);
//   });
// }

// async function executeAddFunction() {
//   let sum3 = 0;
//   try {
//     const sum = await add(1, 2);
//     const sum2 = await add(sum, 3);
//     sum3 = await add(sum2, 4);
//   } catch (err) {
//     throw err;
//   }
//   return sum3;
// }

// executeAddFunction()
//   .then((result) => console.log(result))
//   .catch((err) => console.log(err.message))
//   .finally(() => console.log("Finished"));

// add(1, 2)
//   .then((sum) => {
//     return add(sum, 3);
//   })
//   .then((sum2) => {
//     return add(sum2, 4);
//   })
//   .then((sum3) => {
//     console.log(sum3);
//   })
//   .catch((err) => console.log(err.message))
//   .finally(() => console.log("Finished"));

// function add(first, second, callbackFunction) {
//   setTimeout(function () {
//     callbackFunction(first + second);
//   }, 1000);
// }

// add(1, 2, (sum1) => {
//   add(sum1, 3, (sum2) => {
//     add(sum2, 4, (sum3) => {
//       console.log(sum3);
//     });
//   });
// });
