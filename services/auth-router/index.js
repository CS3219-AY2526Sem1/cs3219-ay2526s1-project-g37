const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { admin } = require("./firebase-admin-config");

const app = express();
app.use(cors());

const COLLAB_SERVICE_URL = process.env.COLLAB_SERVICE_URL || "http://localhost:8000";
const MATCHING_SERVICE_URL = process.env.MATCHING_SERVICE_URL || "http://localhost:8001";
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || "http://localhost:8002";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:8003";

console.log("--- USER-SERVICE ENVIRONMENT VARIABLES ---");
console.log("PORT:", process.env.PORT);
console.log("QUESTION_SERVICE_URL:", process.env.QUESTION_SERVICE_URL);
console.log("MATCHING_SERVICE_URL:", process.env.MATCHING_SERVICE_URL);
console.log("COLLAB_SERVICE_URL:", process.env.COLLAB_SERVICE_URL);
console.log("USER_SERVICE_URL:", process.env.USER_SERVICE_URL);
console.log(
    "GOOGLE_APPLICATION_CREDENTIALS:",
    process.env.GOOGLE_APPLICATION_CREDENTIALS ? "Exists" : "Does not exist"
);
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
    "/users",
    verifyToken,
    createProxyMiddleware({
        target: USER_SERVICE_URL,
        changeOrigin: true,
        onProxyReq,
    })
);

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
    res.send("Middleware Service is healthy");
});

const PORT = process.env.MIDDLEWARE_PORT || 4000;
app.listen(PORT, () => {
    console.log(`Middleware Service listening on port ${PORT}`);
});
