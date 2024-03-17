module.exports = function generateForgotPassOTP() {
  const OTP = Math.floor(Math.random() * 999999) + 123456;

  return OTP.toString();
};
