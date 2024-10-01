import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import encrptionRoutes from "./routes/encryption.routes";
import homePageRoutes from "./routes/home.route";

const app = express();
const port = 8000; // temp hardcoding 8000

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());

app.use("/", homePageRoutes);
app.use("/api/encryption", encrptionRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
