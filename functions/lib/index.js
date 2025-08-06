"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredActiveChats = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const functionsV1 = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const agora_access_token_1 = require("agora-access-token");
dotenv_1.default.config();
admin.initializeApp();
// --- Express API for Agora Token ---
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.get("/generate-agora-token", (req, res) => {
    const { channelName, uid, role } = req.query;
    if (!channelName || !uid || !role) {
        return res.status(400).json({
            error: "Missing required query parameters (channelName, uid, role)",
        });
    }
    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const agoraRole = role === "publisher" ? agora_access_token_1.RtcRole.PUBLISHER : agora_access_token_1.RtcRole.SUBSCRIBER;
    const expireTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTimestamp = currentTimestamp + expireTimeInSeconds;
    const uidNum = isNaN(Number(uid)) ? 0 : Number(uid);
    const token = agora_access_token_1.RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uidNum, agoraRole, privilegeExpireTimestamp);
    return res.status(200).json({ token });
});
// 🌐 Export the Express app
exports.api = functions.https.onRequest(app);
exports.cleanupExpiredActiveChats = functionsV1.pubsub
    .schedule("every 5 minutes")
    .timeZone("Asia/Kolkata") // Optional: match your time zone
    .onRun(async () => {
    const db = admin.firestore();
    const now = new Date();
    try {
        const snapshot = await db
            .collection("activeChats")
            .where("expiresAt", "<=", now)
            .get();
        if (snapshot.empty) {
            console.log("✅ No expired activeChats found.");
            return null;
        }
        console.log(`🧹 Found ${snapshot.docs.length} expired activeChats. Deleting...`);
        const deletions = snapshot.docs.map((doc) => {
            console.log(`🗑️ Deleting document: ${doc.id}`);
            return doc.ref.delete();
        });
        await Promise.all(deletions);
        console.log("✅ Cleanup completed.");
    }
    catch (error) {
        console.error("❌ Error cleaning up activeChats:", error);
    }
    return null;
});
//# sourceMappingURL=index.js.map