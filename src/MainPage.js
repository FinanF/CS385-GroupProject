import { useState, useEffect } from "react";
import React from "react";
import "./MainPage.css";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import CS385_project_LOGO from "./CS385-project-LOGO.png";
import Profile_icon from "./Profile_icon.png";
import Add_icon from "./Add_icon.png";

function MainPage() {
  const [added, setAdded] = useState({
    item: "",
    budgetGoal: "",
    budgetSaved: "",
  });
  const [dbData, setdbData] = useState([]);
  const [id, setId] = useState(0);
  const [savings, setSavings] = useState(0);
  const [newSavings, setNewSavings] = useState(0);

  const db = getFirestore();

  // Each funtion in relation to the datebase was debugged using ChatGPT

  // Fetch the last user ID from Firestore
  async function getLastUserId() {
    try {
      const usersCollection = collection(db, "manage");
      const snapshot = await getDocs(usersCollection);
      if (!snapshot.empty) {
        const userIds = snapshot.docs.map((doc) => parseInt(doc.id));
        const lastId = Math.max(...userIds);
        return lastId;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      return 0;
    }
  }

  // Fetch existing savings
  async function getSaving() {
    try {
      const savingsDoc = await getDoc(doc(db, "savings", "1"));
      if (savingsDoc.exists()) {
        const savingCount = savingsDoc.data().savingCount;
        setSavings(savingCount); // Update state
        return savingCount;
      } else {
        console.log("No savings data available");
        setSavings(""); // Set default value if no data exists
      }
    } catch (error) {
      console.error("Error fetching savings:", error);
      setSavings(""); // Ensure state doesn't break
    }
  }

  // Fetch all rows from Firestore
  async function getRows() {
    try {
      const usersCollection = collection(db, "manage");
      const snapshot = await getDocs(usersCollection);
      if (!snapshot.empty) {
        const dataArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setdbData(dataArray);
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching rows:", error);
    }
  }

  // Write a new row to Firestore
  async function writeRow(newId, item, budgetSaved, budgetGoal) {
    try {
      await setDoc(doc(db, "manage", newId.toString()), {
        item: item,
        budgetSaved: budgetSaved,
        budgetGoal: budgetGoal,
      });
      console.log("Row written successfully");
    } catch (error) {
      console.error("Error writing row:", error);
    }
  }

  // Write savings to Firestore
  async function writeSavingsAdd(newSavingInput) {
    try {
      const savingsDocRef = doc(db, "savings", "1");
      const savingsDoc = await getDoc(savingsDocRef);

      let currentSavings = 0;

      if (savingsDoc.exists()) {
        currentSavings = parseFloat(savingsDoc.data().savingCount) || 0;
      }

      const updatedSavings = currentSavings + parseFloat(newSavingInput);

      await setDoc(savingsDocRef, { savingCount: updatedSavings });

      setSavings(updatedSavings);
      setNewSavings("");
      console.log("Savings updated successfully");
    } catch (error) {
      console.error("Error updating savings:", error);
    }
  }
  async function writeSavingsSub(newSavingInput) {
    try {
      const savingsDocRef = doc(db, "savings", "1");
      const savingsDoc = await getDoc(savingsDocRef);

      let currentSavings = 0;

      if (savingsDoc.exists()) {
        currentSavings = parseFloat(savingsDoc.data().savingCount) || 0;
      }

      const updatedSavings = currentSavings - parseFloat(newSavingInput);

      await setDoc(savingsDocRef, { savingCount: updatedSavings });

      setSavings(updatedSavings);
      setNewSavings("");
      console.log("Savings updated successfully");
    } catch (error) {
      console.error("Error updating savings:", error);
    }
  }

  // Load initial data when the component mounts
  useEffect(() => {
    getLastUserId().then((lastId) => setId(lastId + 1));
    getSaving();
    getRows();
  }, []);

  // Handle button click to add a new row
  const handleClick = async () => {
    if (
      added.item.trim() !== "" &&
      added.budgetSaved.trim() !== "" &&
      added.budgetGoal.trim() !== ""
    ) {
      const newId = id; // Use the current ID
      console.log("Writing new entry with ID:", Number(id));
      await writeRow(newId, added.item, added.budgetSaved, added.budgetGoal);
      setId(newId + 1); // Increment ID after writing
      setAdded({ item: "", budgetGoal: "", budgetSaved: "" });
      getRows();
    } else {
      alert("Please fill out all fields before submitting.");
    }
  };

  return (
    <div>
      <header>
        <img src={CS385_project_LOGO} alt="Logo" className="Logo" />
        <h1 className="KK_header">KashKeeper</h1>
      </header>
      <br />

      <div className="Savings">
        <h1 className="Savings_text">Savings: €{savings}</h1>
        <input
          type="number"
          className="Input_box"
          placeholder="Savings"
          value={newSavings}
          onChange={(e) => setNewSavings(e.target.value)}
        />
        <button
          onClick={() => {
            const parsedSavings = parseFloat(newSavings) || 0;
            if (parsedSavings > 0) {
              writeSavingsAdd(parsedSavings);
            } else {
              alert("Please enter a valid savings amount.");
            }
          }}
        >
          Add
        </button>
        <button
          onClick={() => {
            const parsedSavings = parseFloat(newSavings) || 0;
            if (parsedSavings > 0) {
              writeSavingsSub(parsedSavings);
            } else {
              alert("Please enter a valid savings amount.");
            }
          }}
        >
          Subtract
        </button>
      </div>
      <div className="Add">
        <input
          type="text"
          placeholder="Item"
          className="Input_box"
          value={added.item}
          onChange={(e) => setAdded({ ...added, item: e.target.value })}
        />
        <input
          type="number"
          placeholder="Goal"
          className="Input_box"
          value={added.budgetGoal}
          onChange={(e) => setAdded({ ...added, budgetGoal: e.target.value })}
        />
        <input
          type="number"
          placeholder="Saved"
          className="Input_box"
          value={added.budgetSaved}
          onChange={(e) => setAdded({ ...added, budgetSaved: e.target.value })}
        />
        <img
          src={Add_icon}
          alt="Add_icon"
          className="Add_icon"
          width={40}
          onClick={() => handleClick()}
        />
      </div>
      <div className="Account_List">
        {dbData.map((row, rowIndex) => (
          <div
            className="Account_List_Row"
            key={rowIndex}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "30px",
              marginBottom: "20px",
            }}
          >
            <p>
              {rowIndex + 1}, €{row.budgetSaved}
            </p>
            <p style={{ fontSize: "20px", borderBottom: "10px" }}>
              of €{row.budgetGoal} {row.item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainPage;
