const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());


app.use(express.static(path.join(__dirname, "public")));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

app.post("/ask", async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,{
                contents: [{ parts: [{ text: prompt }] }]
            }
        );        
        res.json(response.data);
    } catch (error) {
        console.error("Error from Gemini API:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get response from Gemini AI" });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => console.log("Server running on port 3000"));
