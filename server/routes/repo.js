import express from "express";
import axios from "axios";
import patterns from "../regex/patterns.js";

const router = express.Router();

const GITHUB_HEADERS = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "Secret-Scanner"
};

// Scan a GitHub repository
router.post("/", async (req, res) => {
    try {
        console.log("Repo route hit!");

        // Get repository URL
        const { repoUrl } = req.body;

        if (!repoUrl) {
            return res.status(400).json({
                success: false,
                message: "Repository URL is required."
            });
        }

        // Extract owner and repo
        const parts = repoUrl.split("/");
        const owner = parts[3];
        const repo = parts[4];

        if (!owner || !repo) {
            return res.status(400).json({
                success: false,
                message: "Invalid GitHub repository URL."
            });
        }

        console.log("Owner:", owner);
        console.log("Repo:", repo);

        console.log("Starting recursive scan...");

        const treeResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
            { headers: GITHUB_HEADERS }
        );

        const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB size limit
        const files = treeResponse.data.tree.filter(
            item => item.type === "blob" && (!item.size || item.size <= MAX_FILE_SIZE_BYTES)
        );
        console.log("Finished recursive scan.");
        console.log("Files found:", files.length);

        const results = [];

        // Scan every file
        for (const file of files) {

            console.log("Downloading:", file.path);

            const blobResponse = await axios.get(file.url, {
                headers: GITHUB_HEADERS
            });

            // Decode Base64 content
            const content = Buffer.from(
                blobResponse.data.content,
                "base64"
            ).toString("utf8");

            const findings = [];
            const lines = content.split("\n");
            
            lines.forEach((line, index) => {
                patterns.forEach(pattern => {
                    const matches = line.match(pattern.regex);

                    if (matches) {
                        findings.push({
                            type: pattern.name,
                            line: index + 1,
                            matches
                        });
                    }
                });
            });

            results.push({
                file: file.path.split("/").pop(),
                path: file.path,
                findings
            });
        }

        console.log("Repository scan complete.");

        return res.json({
            success: true,
            repository: `${owner}/${repo}`,
            filesScanned: results.length,
            results
        });

    } catch (error) {

        console.log("===== ERROR =====");
        console.log("Status:", error.response?.status);
        console.log("URL:", error.config?.url);
        console.log("Response:", error.response?.data);
        console.log("Message:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;