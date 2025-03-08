import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import app from "./firebaseConfiguration"; // Import initialized Firebase app

const userLog = () => {
  const [user, setUser] = useState(null); // Store the authenticated user
  const [activityLog, setActivityLog] = useState([]); // Track activities

  const auth = getAuth(app);
  const db = getFirestore(app);

  // Function to log activity
  const logActivity = async (activity) => {
    if (!user) return;

    // Add activity to local state
    const newActivity = {
      activity,
      timestamp: new Date().toISOString(),
    };
    setActivityLog((prevLog) => [...prevLog, newActivity]);

    // Save activity to Firestore
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        activityLog: arrayUnion(newActivity),
      });
    } catch (err) {
      console.error("Error updating activity log:", err);
    }
  };

  // Fetch user data on login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Check if user data exists in Firestore; if not, create it
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: currentUser.email,
            activityLog: [],
          });
        } else {
          // Load activity log from Firestore
          setActivityLog(userDoc.data().activityLog || []);
        }
      } else {
        setUser(null);
        setActivityLog([]);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  // Example activities
  const handleExampleActions = () => {
    logActivity("Viewed homepage");
    setTimeout(() => logActivity("Clicked 'Learn More'"), 1000);
  };

  return (
    <div>
      <h2>User Activity Tracker</h2>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={handleExampleActions}>Simulate User Actions</button>
          <h3>Activity Log:</h3>
          <ul>
            {activityLog.map((activity, index) => (
              <li key={index}>
                {activity.activity} -{" "}
                {new Date(activity.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
          <ul>
            {activityLog.map((entry, index) => (
              <li key={index}>
                {formatDate(entry.date)} - ${entry.amount.toFixed(2)} (
                {entry.category})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Please log in to track your activities.</p>
      )}
    </div>
  );
};

export default userLog;
