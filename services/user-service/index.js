const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { admin } = require("./firebase-admin-config");

const app = express();
app.use(cors());

const MATCHING_SERVICE_URL = process.env.MATCHING_SERVICE_URL || "http://localhost:8001";
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || "http://localhost:8002";
const COLLAB_SERVICE_URL = process.env.COLLAB_SERVICE_URL || "http://localhost:8000";

console.log("--- USER-SERVICE ENVIRONMENT VARIABLES ---");
console.log("PORT:", process.env.PORT);
console.log("QUESTION_SERVICE_URL:", process.env.QUESTION_SERVICE_URL);
console.log("MATCHING_SERVICE_URL:", process.env.MATCHING_SERVICE_URL);
console.log("COLLAB_SERVICE_URL:", process.env.COLLAB_SERVICE_URL);
console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log("------------------------------------------");

const verifyToken = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = header.split(" ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};

const onProxyReq = (proxyReq, req, res) => {
    if (req.user) {
        proxyReq.setHeader("x-user-id", req.user.uid);
        proxyReq.setHeader("x-user-email", req.user.email);
    }
};

app.use(
    "/matching",
    verifyToken,
    createProxyMiddleware({
        target: MATCHING_SERVICE_URL,
        changeOrigin: true,
        onProxyReq,
    })
);

app.use(
    "/questions",
    verifyToken,
    createProxyMiddleware({
        target: QUESTION_SERVICE_URL,
        changeOrigin: true,
        onProxyReq,
    })
);

app.use(
    "/collaboration",
    verifyToken,
    createProxyMiddleware({
        target: COLLAB_SERVICE_URL,
        changeOrigin: true,
        onProxyReq,
    })
);

app.get("/health", (req, res) => {
    res.send("User Service is healthy");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`User Service listening on port ${PORT}`);
});
