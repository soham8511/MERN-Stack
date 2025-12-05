require("dotenv").config();
const express = require("express");
const { json } = require("express");
const connectDB = require("./config/db");
const resourceRouter = require("./routes/resources");


const app = express();

// Body parser
app.use(json());

// Test route
app.get("/", (req, res) => res.send("API is working! 🔥"));

// Mount auth routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);
app.use("/api/resources", resourceRouter);

const PORT = process.env.PORT || 5000;

// Start after DB connects
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
