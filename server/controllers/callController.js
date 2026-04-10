import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = pkg;
import Call from '../models/Call.js';

export const createCall = async (req, res) => {
  try {
    const { patientName, patientEmail, callType, channelName } = req.body;
    
    // Check for existing active calls
    const existingCall = await Call.findOne({ 
      patientEmail, 
      status: { $in: ['waiting', 'connected'] } 
    });

    if (existingCall) {
      return res.json(existingCall);
    }

    const call = await Call.create({
      patientName,
      patientEmail,
      callType,
      channelName,
      status: 'waiting',
    });

    res.status(201).json(call);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCallStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const call = await Call.findById(id);
    if (!call) return res.status(404).json({ message: 'Call not found' });
    res.json(call);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCallStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const call = await Call.findByIdAndUpdate(id, { status }, { new: true });
    res.json(call);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endCall = async (req, res) => {
  try {
    const { id } = req.params;
    await Call.findByIdAndDelete(id);
    res.json({ message: 'Call ended and removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateToken = async (req, res) => {
  const channelName = req.query.channelName;
  if (!channelName) {
    return res.status(400).json({ 'error': 'channel is required' });
  }

  let uid = req.query.uid || 0;
  let role = RtcRole.PUBLISHER;

  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  
  if (!appID || !appCertificate) {
    return res.status(500).json({ 'error': 'Agora credentials not set' });
  }

  const expirationTimeInSeconds = 3600 * 24;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredts = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredts);
  res.json({ token });
};
