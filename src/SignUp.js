import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfiguration";
import CS385_project_LOGO from "./CS385-project-LOGO.png";
import "./SignUp.css";
const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(""); // state for username
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validate email format
    if (!emailRegex.test(email)) {
      setError("Invalid email format. Please enter a valid email.");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Ensure passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    // Attempt Firebase user creation
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
      });
      setSuccess("Account created successfully! You can now log in.");
      setError("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Sign-up failed. " + err.message);
      setSuccess("");
    }
  };

  return (
    <div>
      <header>
        <img src={CS385_project_LOGO} alt="Logo" className="Logo" />
        <h1 className="KK_header">KashKeeper</h1>
      </header>
      <h2
        style={{
          backgroundColor: "#ffffff",
          width: "93px",
          borderRadius: "6px",
        }}
      >
        Sign Up
      </h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSignUp} className="SignUp">
        <label>Username:</label>
        <input
          type="text"
          value={username}
          className="Input_box"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br />
        <label>Email:</label>
        <input
          type="email"
          value={email}
          className="Input_box"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          className="Input_box"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <label>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          className="Input_box"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
