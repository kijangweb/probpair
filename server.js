const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(express.static(".")); // serve frontend HTML

// --- Konfigurasi ---
const PIN = "1234"; // PIN untuk akses update
const GITHUB_TOKEN = process.env.GH_PAT; // simpan token di .env
const REPO_OWNER = "kijangweb";
const REPO_NAME = "probpair";
const FILE_PATH = "data.json";
const BRANCH = "main";

// --- Endpoint update JSON ---
app.post("/update-json", async (req, res) => {
  const { pin, jsonData } = req.body;

  if(pin !== PIN) return res.status(403).json({ error: "PIN salah" });

  try {
    // Ambil SHA file di repo
    const getRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const getData = await getRes.json();
    const sha = getData.sha;

    // Commit perubahan
    const commitRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: { Authorization: `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Update JSON via web`,
        content: Buffer.from(JSON.stringify(jsonData, null, 2)).toString("base64"),
        branch: BRANCH,
        sha
      })
    });

    const commitData = await commitRes.json();
    res.json(commitData);

  } catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
