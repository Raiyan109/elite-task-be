import axios from "axios";

export const SendPhoneOTP = async (
  otp: number | any,
  number: string | any
) => {
  try {
    const response = await axios.get(
      `https://sms.rapidsms.xyz/request.php?user_id=tushar&password=tushar10840&number=${number}&message=Your Otp Is %20<b><u>${otp}</u></b>`
    );
    if (response?.data?.status == "success") {
      console.log("OTP sent successfully", response?.data);
      
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};