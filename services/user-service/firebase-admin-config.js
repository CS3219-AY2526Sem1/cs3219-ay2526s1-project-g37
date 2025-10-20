const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

console.log("Service Account:", {
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    // Do not log private_key for security reasons
});

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = { admin };
