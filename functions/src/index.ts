import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

dotenv.config();
admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

app.get("/generate-agora-token", (req, res) => {
  const { channelName, uid, role } = req.query;

  if (!channelName || !uid || !role) {
    return res.status(400).json({ error: "Missing required query parameters (channelName, uid, role)" });
  }

  const appID = process.env.AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!;

  const agoraRole =
    role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const expireTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTimestamp = currentTimestamp + expireTimeInSeconds;

  const uidNum = isNaN(Number(uid)) ? 0 : Number(uid);

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName as string,
    uidNum,
    agoraRole,
    privilegeExpireTimestamp
  );

  return res.status(200).json({ token });
});

exports.api = functions.https.onRequest(app);
