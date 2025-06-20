const contactService = require('../services/contactService');

exports.identify = async (req, res) => {
  try {
    const { phoneNumber, email } = req.body;
    
    const phoneStr = phoneNumber ? phoneNumber.toString() : null;
    
    const response = await contactService.identifyContact(phoneStr, email);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in identify:', error);
    res.status(400).json({ error: error.message });
  }
};