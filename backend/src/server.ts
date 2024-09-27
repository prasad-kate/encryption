import express from "express";
import homePageRoutes from "./routes/home.route";
import encrptionRoutes from "./routes/encryption.routes";

const app = express();
const port = 8000; // temp hardcoding 8000

app.use(express.json());
app.use("/", homePageRoutes);
app.use("/get-aes-key", encrptionRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
