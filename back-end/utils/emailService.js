const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sriyasimrandash@gmail.com',      // replace with your Gmail
    pass: 'hnta zfeq feac msmr'          // replace with your App Password
  }
});

const sendOTPEmail = async (to, otp) => {
  const html = `
    <div style="font-family:Arial; border:1px solid #ccc; padding:20px;">
      <h2>Your OTP Code</h2>
      <p>Use the OTP below to complete registration:</p>
      <h3 style="background:#f4f4f4; padding:10px; display:inline-block;">${otp}</h3>
      <p>This OTP is valid for 5 minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: '"DigiGoat" <your_email@gmail.com>',
    to,
    subject: 'Your OTP Code',
    html
  });
};

module.exports = sendOTPEmail;
