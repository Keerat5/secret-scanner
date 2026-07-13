import express from "express";
import path from "path";
import "dotenv/config";
import { fileURLToPath } from "url";
import uploadRoute from "./routes/upload.js";
import repoRoute from "./routes/repo.js";
console.log("TOKEN:", process.env.GITHUB_TOKEN);

const app = express();
const PORT = process.env.PORT || 3000;

// Recreate __dirname (ES Modules don't have it by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());

app.use("/scan-repo", repoRoute);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../client")));

// Mount upload routes
app.use("/upload", uploadRoute);

// Home Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});