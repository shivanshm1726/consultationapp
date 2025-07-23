const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { RtcTokenBuilder, RtcRole } = require('agora-access-token')

admin.initializeApp()

exports.generateAgoraToken = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid
  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in')
  }

  const channelName = data.channelName
  if (!channelName) {
    throw new functions.https.HttpsError('invalid-argument', 'Channel name is required')
  }

  const appID = process.env.AGORA_APP_ID
  const appCertificate = process.env.AGORA_APP_CERTIFICATE
  const expirationTimeInSeconds = 3600

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    expirationTimeInSeconds
  )

  return { token }
})
