import React, { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import MainPage from "./MainPage.js";
import ManagePage from "./ManagePage.js";
import { FirebaseLogin } from "./Login";
import AnalyticsPage from "./AnalyticsPage.js";
import DreamBoardPage from "./DreamboardPage.js";
import { getFirestore } from "firebase/firestore";
import SignUp from "./SignUp";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup

  return (
    <div>
      {!isLoggedIn ? (
        <div>
          {isLogin ? (
            <FirebaseLogin onLoginSuccess={() => setIsLoggedIn(true)} />
          ) : (
            <SignUp />
          )}
          <br />
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="Create_Account"
          >
            {isLogin ? "Create an Account" : "Already have an Account? Log In"}
          </button>
        </div>
      ) : (
        // If logged in, show the navigation and routes
        <div>
          <nav className="navbar">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Main
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/manage" className="nav-link">
                  Manage
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/dreamboard" className="nav-link">
                  Dreamboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/analytics" className="nav-link">
                  Analytics
                </Link>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/manage" element={<ManagePage />} />
            <Route path="/dreamboard" element={<DreamBoardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default App;
