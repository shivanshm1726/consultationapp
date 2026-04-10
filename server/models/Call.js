import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  },
  patientEmail: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
  },
  callType: {
    type: String,
    enum: ['audio', 'video'],
    default: 'video',
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
  },
  status: {
    type: String,
    enum: ['waiting', 'connected', 'ended'],
    default: 'waiting',
  },
  channelName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Call = mongoose.model('Call', callSchema);

export default Call;
