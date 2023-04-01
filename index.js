const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoute = require("./routes/user");
const eventRoute = require("./routes/events");
const adminRoute = require("./routes/admin");

//configs and setups
dotenv.config();
const app = express();

//middlewares
app.use(express.json());
app.use(cors());

//routes
app.use("/users", userRoute);
app.use("/events", eventRoute);
app.use("/admin", adminRoute);

//error handling
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 502;
  res.status(statusCode).json({ msg: error.message });
  next();
});

//server and db connections
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => console.log(err));
});
