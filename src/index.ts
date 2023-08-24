import express from "express";
import bodyParser from "body-parser";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

//All the routes goes here
app.use("/api", routes);

// Middleware for authorization
app.use((req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  if (!authorizationHeader || authorizationHeader !== "Bearer 1234567890") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
