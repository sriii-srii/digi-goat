import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './css/login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");
      const data = contentType && contentType.includes("application/json")
        ? await response.json()
        : { message: 'Unexpected server response' };

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { user } = data;

      localStorage.setItem('name', user.name);
      localStorage.setItem('role', user.role);

      Swal.fire({
        icon: 'success',
        title: `Welcome, ${user.name}`,
        text: 'You have successfully logged in',
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => {
        const role = parseInt(user.role);
        if (role === 1) {
          navigate('/customer-dashboard');
        } else if (role === 0) {
          navigate('/admin-dashboard');
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Unknown role',
            text: 'Contact support. Unknown user role.',
          });
        }
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login failed',
        text: err.message || 'Something went wrong!',
      });
    }
  };

  return (
    <div className="flex font-poppins items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-5 space-y-5 bg-white rounded-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          {isLogin ? "Log in" : "Sign up"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="w-full p-3 border rounded-xl bg-gray-100"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block mb-2">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full p-3 pr-10 border rounded-xl bg-gray-100"
            />
            <span
              className="absolute top-11 right-4 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="text-center">
          <span className="text-sm text-gray-700">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-500 hover:underline"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
