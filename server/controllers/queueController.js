import QueueSession from '../models/QueueSession.js';

// @desc    Get or Create today's Queue Session for a doctor
// @route   GET /api/queue/:doctorId
// @access  Private (Receptionist/Admin)
export const getTodayQueue = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    // Restrict access using clinicId rules
    let session = await QueueSession.findOne({ doctorId, date: today });

    if (!session) {
      session = await QueueSession.create({
        clinicId: req.clinicId,
        doctorId,
        date: today,
        activeToken: 0,
        maxTokenIssued: 0
      });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Issue new patient token
// @route   POST /api/queue/:doctorId/token
// @access  Private
export const issueToken = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const session = await QueueSession.findOneAndUpdate(
      { doctorId, date: today },
      { $inc: { maxTokenIssued: 1 } },
      { new: true, upsert: true }
    );

    res.json({ tokenNumber: session.maxTokenIssued });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Call next patient (Update active Token)
// @route   PUT /api/queue/:doctorId/next
// @access  Private
export const callNextPatient = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const session = await QueueSession.findOneAndUpdate(
      { doctorId, date: today },
      { $inc: { activeToken: 1 } },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'No active session today' });
    }

    // Emit event to WebSocket clients listening to this doctor's queue
    const io = req.app.get('io');
    const room = `${session.clinicId.toString()}_${doctorId}`;
    io.to(room).emit('queue_update', {
      activeToken: session.activeToken,
      doctorId
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
