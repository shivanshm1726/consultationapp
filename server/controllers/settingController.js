import Setting from '../models/Setting.js';

export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    let setting = await Setting.findOne({ key });
    
    // Default values if not found
    if (!setting && key === 'appointmentStatus') {
      setting = { key: 'appointmentStatus', value: { active: true } };
    }
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
