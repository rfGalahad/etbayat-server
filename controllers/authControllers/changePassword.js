import bcrypt from 'bcryptjs';
import * as userModel from '../../models/userModel.js';



export const changePassword = async (req, res) => {
  try {
    const { userID } = req.params;
    const { oldPassword, newPassword } = req.body;
    
    // FIND USER
    const user = await userModel.findUserByID(userID);
    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }
    
    // VERIFY OLD PASSWORD
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Current password is incorrect"
      });
    }
    
    // HASH NEW PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // UPDATE PASSWORD
    await userModel.updateUserPassword(userID, hashedPassword);
    
    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      error: "Error changing password",
      details: error.message
    });
  }
};
