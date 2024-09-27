import express from "express";
import homePageRoutes from "./routes/home.route";
import encrptionRoutes from "./routes/encryption.routes";
import cors from "cors";

const app = express();
const port = 8000; // temp hardcoding 8000

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.json());
app.use("/", homePageRoutes);
app.use("/api/encryption", encrptionRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
