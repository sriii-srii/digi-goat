import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/registration.css';
import Swal from 'sweetalert2';

function Registration() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(1); // Default: Customer
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [address, setAddress] = useState("");
  const [photoFile, setPhotoFile] = useState(null); // For file input
  const [photoPath, setPhotoPath] = useState("");   // Simulated path for DB

  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPath("/uploads/" + Date.now() + "-" + file.name); // Simulate server file path
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!name || !phoneNumber || !email || !password || (role === 1 && (!address || !photoFile))) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'All required fields must be filled!',
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setOtpSent(true);
        Swal.fire({
          icon: 'info',
          title: 'OTP Sent',
          text: 'Check your email for the OTP.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'OTP Error',
          text: result.message || 'Failed to send OTP.',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'Could not send OTP.',
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otp) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing OTP',
        text: 'Please enter the OTP sent to your email.',
      });
      return;
    }

    try {
      // Use FormData to include file
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone_number", phoneNumber);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      formData.append("otp", otp);
      if (role === 1) {
        formData.append("address", address);
        formData.append("photo", photoFile); // actual file
        formData.append("photo_path", photoPath); // simulated DB path
      }

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        credentials: "include",
        body: formData, // not JSON!
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Registered Successfully',
          text: 'You can now log in!',
        }).then(() => navigate("/login"));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: result.message || 'Could not register.',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong.',
      });
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2 className="registration-title">Register</h2>

        <form onSubmit={otpSent ? handleRegister : handleSendOtp}>
          <div className="input-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(Number(e.target.value))} required>
              <option value={1}>Customer</option>
              <option value={0}>Admin</option>
            </select>
          </div>

          {role === 1 && (
            <>
              <div className="input-group">
                <label>Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Photo Upload</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} required />
              </div>
            </>
          )}

          {otpSent && (
            <div className="input-group">
              <label>Enter OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
          )}

          <button type="submit" className="registration-button">
            {otpSent ? "Verify & Register" : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Registration;
