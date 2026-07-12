import express from "express";
import axios from "axios"; //Backend uses axios to talk to GitHub.(same as fetch() which used in frontend to talk to backend)

const router = express.Router();

router.post("/", async (req, res) => {

    const repoUrl = req.body.repoUrl;

    if (!repoUrl) {
        return res.json({
            success: false,
            message: "Repository URL is required."
        });
    }

    try {

        // Split URL into parts
        const parts = repoUrl.split("/");

        // Extract owner and repository name
        const owner = parts[3];
        const repo = parts[4];

        console.log("Owner:", owner);
        console.log("Repository:", repo);

        res.json({
            success: true,
            owner,
            repo
        });

    } catch (err) {

        res.json({
            success: false,
            message: "Invalid GitHub URL."
        });

    }

});

export default router;