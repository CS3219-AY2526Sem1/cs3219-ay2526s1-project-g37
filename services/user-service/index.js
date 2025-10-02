const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { admin } = require("./firebase-admin-config");

const app = express();
app.use(cors());

const MATCHING_SERVICE_URL = process.env.MATCHING_SERVICE_URL || "http://localhost:4001";
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || "http://localhost:4002";
const COLLABORATION_SERVICE_URL = process.env.COLLABORATION_SERVICE_URL || "http://localhost:4003";

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
        target: COLLABORATION_SERVICE_URL,
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
