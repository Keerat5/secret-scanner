import express from "express";
import multer from "multer";
import fs from "fs/promises";
import patterns from "../regex/patterns.js";
import fs from "fs";


const router = express.Router(); // Create a mini router for upload-related routes

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer to save uploaded files in server/uploads
const upload = multer({
    dest: "./server/uploads/"
});

// POST /upload
router.post("/", upload.single("file"), async (req, res) => {

    // Read uploaded file
    const content = await fs.readFile(req.file.path, "utf-8");

    const findings = [];

    // Check every regex pattern
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (const pattern of patterns) {
            const matches = line.match(pattern.regex);

            if (matches) {
                findings.push({
                    type: pattern.name,
                    line: i + 1,
                    matches
                });
            }
        }
    }

    // Return scan results
    res.json({
        success: true,
        findings
    });

});

export default router; // Export router to use in server.js