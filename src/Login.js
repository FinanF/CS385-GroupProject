import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth method
import { auth } from "./firebaseConfiguration"; // Import the auth instance from firebaseConfiguration
import "./Login.css";
import CS385_project_LOGO from "./CS385-project-LOGO.png";

const FirebaseLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [errorMessage, setErrorMessage] = useState(""); // State for error message display

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate email format using regex
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email format. Please enter a valid email.");
      return;
    }

    // Attempt Firebase Authentication
    try {
      await signInWithEmailAndPassword(auth, email, password); // Use auth from firebaseConfiguration
      alert("Login Successful!");
      setErrorMessage(""); // Clear error message on success
      onLoginSuccess();
    } catch (err) {
      setErrorMessage("Authentication failed. " + err.message); // Show error message if login fails
    }
  };

  return (
    <div className="Login">
      <header>
        <img src={CS385_project_LOGO} alt="Logo" className="Logo" />
        <h1 className="KK_header">KashKeeper</h1>
      </header>
      <br />
      <div className="Welcome_Login">
        <h1>Welcome to Your Account</h1>
        <h2>Login</h2>
      </div>
      {/* Login Form */}
      <form onSubmit={handleLogin} className="Login_details">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          className="Input_box"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Handle email input change
          placeholder="Email"
          required
        />
        <br />
        <br />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          className="Input_box"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Handle password input change
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      {/* Display error message if any */}
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </div>
  );
};

export { FirebaseLogin };
