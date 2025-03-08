import { useState, useEffect } from "react";
import React from "react";
import "./ManagePage.css";
import "./MainPage.css";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import CS385_project_LOGO from "./CS385-project-LOGO.png";
import Profile_icon from "./Profile_icon.png";
import Add_icon from "./Add_icon.png";

function ManagePage() {
  const [dbData, setdbData] = useState([]);
  const [id, setId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEdit, setSelectedEdit] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    item: "",
    budgetSaved: "",
    budgetGoal: "",
  });

  // Each funtion in relation to the datebase was debugged using ChatGPT

  const db = getFirestore();

  // Fetch last user ID
  const getLastUserId = async () => {
    const usersCollection = collection(db, "manage");
    const querySnapshot = await getDocs(usersCollection);
    if (!querySnapshot.empty) {
      const ids = querySnapshot.docs.map((doc) => Number(doc.id));
      const lastId = Math.max(...ids);
      return lastId;
    }
    return 0;
  };

  // Fetch all rows
  const getRows = async () => {
    const usersCollection = collection(db, "manage");
    const querySnapshot = await getDocs(usersCollection);
    const dataArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setdbData(dataArray);
  };

  // Write a row to Firestore
  const writeRow = async (id, item, budgetSaved, budgetGoal) => {
    const userDoc = doc(db, "manage", id.toString());
    await setDoc(userDoc, {
      item: item,
      budgetSaved: budgetSaved,
      budgetGoal: budgetGoal,
    });
  };

  // Delete a row
  const handleDelete = async (rowIndex) => {
    const rowToDelete = dbData[rowIndex];
    const userDoc = doc(db, "manage", rowToDelete.id);
    await deleteDoc(userDoc);
    getRows();
  };

  // Handle search
  const handleSearch = async () => {
    const usersCollection = collection(db, "manage");
    const querySnapshot = await getDocs(usersCollection);
    const allUsers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const filteredResults = allUsers.filter((user) => {
      const query = searchQuery.toLowerCase();
      return (
        user.item.toLowerCase().includes(query) ||
        user.budgetSaved.toString().includes(query) ||
        user.budgetGoal.toString().includes(query)
      );
    });

    setSearchResults(filteredResults);
  };

  // Handle edit
  const handleEdit = (rowIndex) => {
    const rowToEdit = dbData[rowIndex];
    setEditValues({
      item: rowToEdit.item,
      budgetSaved: rowToEdit.budgetSaved,
      budgetGoal: rowToEdit.budgetGoal,
    });
    setEditRowIndex(rowIndex);
    setSelectedEdit(!selectedEdit);
  };

  const returnEdit = async () => {
    if (editRowIndex !== null) {
      const { item, budgetSaved, budgetGoal } = editValues;
      const userDoc = doc(db, "manage", dbData[editRowIndex].id);
      await updateDoc(userDoc, {
        item,
        budgetSaved,
        budgetGoal,
      });
      setEditRowIndex(null);
      setEditValues({ item: "", budgetSaved: "", budgetGoal: "" });
      getRows();
      setSelectedEdit(false);
    }
  };

  // Initial setup
  useEffect(() => {
    getLastUserId().then((lastId) => setId(lastId + 1));
    getRows();
  }, []);

  return (
    <div>
      <header>
        <img src={CS385_project_LOGO} alt="Logo" className="Logo" />
        <h1 className="KK_header">KashKeeper</h1>
      </header>
      <br />
      <div className="Buttons">
        {isEditing == false && isDeleting == false && (
          <button
            className="Search_button"
            onClick={() => {
              setIsSearching(!isSearching);
              setSearchQuery("");
              setSearchResults([]);
            }}
          >
            Search
          </button>
        )}
        {isSearching == false && isDeleting == false && (
          <button
            className="Edit_button"
            onClick={() => {
              if (selectedEdit === false) {
                setSelectedEdit(true);
              }
              setIsEditing(!isEditing);
            }}
          >
            Edit
          </button>
        )}
        {isSearching == false && isEditing == false && (
          <button
            className="Delete_button"
            onClick={() => setIsDeleting(!isDeleting)}
          >
            Delete
          </button>
        )}
      </div>
      <br />

      <div className="Search_bar">
        {isSearching && (
          <div>
            <input
              type="text"
              placeholder="Query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="Input_box"
            />
            <button className="Search_button_query" onClick={handleSearch}>
              Enter
            </button>
          </div>
        )}
      </div>
      <br />
      {isSearching == false && isEditing == false && isDeleting == false && (
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
      )}
      {isSearching && (
        <div className="Account_List">
          {searchResults.map((row, rowIndex) => (
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
      )}

      {isEditing &&
        ((selectedEdit == false && (
          <div>
            <div className="Add">
              <input
                type="text"
                placeholder="Item"
                className="Input_box"
                value={editValues.item}
                onChange={(e) =>
                  setEditValues({ ...editValues, item: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Goal"
                className="Input_box"
                value={editValues.budgetGoal}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    budgetGoal: parseFloat(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Saved"
                className="Input_box"
                value={editValues.budgetSaved}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    budgetSaved: parseFloat(e.target.value),
                  })
                }
              />
              <button className="Add_button" onClick={returnEdit}></button>
              <img
                src={Add_icon}
                alt="Add_icon"
                className="Add_icon"
                width={40}
              />
            </div>
          </div>
        )) ||
          (selectedEdit == true && (
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
                  <button
                    className="Edit_rows"
                    onClick={() => handleEdit(rowIndex)}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )))}

      {isDeleting == true && (
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
              <button
                className="Edit_rows"
                onClick={() => handleDelete(rowIndex)}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default ManagePage;
