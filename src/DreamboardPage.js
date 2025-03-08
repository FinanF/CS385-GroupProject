import React, { useEffect, useState } from "react";
import "./DreamboardPage.css";
import CS385_project_LOGO from "./CS385-project-LOGO.png";
import home from "./Ellipse_7.png";
import plus from "./Frame_3.png";
import makeup from "./Ellipse 8.png";
import clothes from "./Clothes.png";
import plane from "./Plane.png";
import accessories from "./Accessories.png";
import devices from "./Devices.png";
import eat from "./Eat.png";
import decor from "./Decor.png";
import events from "./Events.png";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const DreamBoardPage = () => {
  const [currentView, setCurrentView] = useState("DreamBoard");
  const [selectedImage, setSelectedImage] = useState(null);
  const [costData, setCostData] = useState("");
  const [wishData, setWishData] = useState("");
  const [savings, setSavings] = useState(0);
  const [dbData, setDbData] = useState([]); // State to store rows data

  const db = getFirestore();

  // Fetch savings from Firestore
  const getSaving = async () => {
    try {
      const savingsDoc = await getDoc(doc(db, "savings", "1"));
      if (savingsDoc.exists()) {
        const savingCount = savingsDoc.data().savingCount;
        setSavings(savingCount); // Update state
      } else {
        console.log("No savings data available");
        setSavings(0); // Set default value if no data exists
      }
    } catch (error) {
      console.error("Error fetching savings:", error);
      setSavings(0); // Ensure state doesn't break
    }
  };

  // Fetch all wishes from Firestore
  const getRows = async () => {
    try {
      const wishesCollection = collection(db, "wishes");
      const snapshot = await getDocs(wishesCollection);
      if (!snapshot.empty) {
        const dataArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDbData(dataArray); // Set the data to state
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching wishes:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getSaving();
      await getRows();
    };

    fetchData();
  }, []);

  const handleDelete = async (rowIndex) => {
    const rowToDelete = dbData[rowIndex];

    if (savings >= rowToDelete.cost) {
      const confirmDelete = window.confirm(
        `Are you sure you want to fulfill this wish? It will cost €${rowToDelete.cost}.`
      );

      if (confirmDelete) {
        const userDoc = doc(db, "wishes", rowToDelete.id);
        try {
          await deleteDoc(userDoc);
          setSavings((prevSavings) => prevSavings - rowToDelete.cost); // Deduct cost from savings
          await setDoc(doc(db, "savings", "1"), {
            savingCount: savings - rowToDelete.cost,
          }); // Update Firestore
          getRows(); // Refresh wishes
        } catch (error) {
          console.error("Error deleting wish:", error);
        }
      }
    } else {
      alert("You don't have enough savings to fulfill this wish!");
    }
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setCurrentView("CostAssigner");
  };

  const handleSubmit = async () => {
    if (!wishData || !costData || costData <= 0) {
      alert("Please enter a valid wish and cost!");
      return;
    }

    const lastWishId = await getLastWishId();
    const newId = lastWishId + 1;

    await writeWishToDatabase(newId, wishData, costData, selectedImage);

    setCurrentView("DreamBoard");
    await getRows(); // Refresh wishes after adding a new one
  };

  const writeWishToDatabase = async (newId, wish, cost, image) => {
    try {
      await setDoc(doc(db, "wishes", newId.toString()), {
        wish,
        cost,
        image,
        createdAt: new Date(),
      });
      console.log("Wish written successfully to Firestore");
    } catch (error) {
      console.error("Error writing wish to Firestore:", error);
    }
  };

  const getLastWishId = async () => {
    try {
      const wishesCollection = collection(db, "wishes");
      const snapshot = await getDocs(wishesCollection);
      if (!snapshot.empty) {
        const wishIds = snapshot.docs.map((doc) => parseInt(doc.id));
        return Math.max(...wishIds);
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error fetching wishes:", error);
      return 0;
    }
  };

  const categories = [
    { name: "Make-up", image: makeup },
    { name: "Clothes", image: clothes },
    { name: "Holidays", image: plane },
    { name: "Accessories", image: accessories },
    { name: "Devices", image: devices },
    { name: "Food & Drink", image: eat },
    { name: "Home Decor", image: decor },
    { name: "Events", image: events },
  ];

  return (
    <div>
      <header>
        <img src={CS385_project_LOGO} alt="Logo" className="Logo" />
        <h1 className="KK_header">KashKeeper</h1>
      </header>
      <br />
      {currentView === "DreamBoard" && (
        <div>
          <div className="Add_Dreamboard">
            <h1>My Dream Board</h1>
            <img
              src={plus}
              alt="Plus Button"
              onClick={() => setCurrentView("SelectionScreen")}
              style={{ cursor: "pointer" }}
            />
          </div>
          <h1 style={{ backgroundColor: "#ffffff" }}>
            When your wish turns from red to green... click it to make it come
            true!
          </h1>
          <label style={{ backgroundColor: "#ffffff", fontSize: "20px" }}>
            Savings: €{savings}
          </label>
          <br />
          <div>
            <label style={{ backgroundColor: "#ffffff", fontSize: "20px" }}>
              Your Wishes:
            </label>
            {dbData.length > 0 ? (
              <div className="Wish_list-container">
                {dbData.map((wish, index) => (
                  <div
                    key={wish.id}
                    className="Wish_list"
                    style={{
                      border: `5px solid ${
                        savings >= wish.cost ? "green" : "red"
                      }`,
                      padding: "10px",
                      borderRadius: "10px",
                      cursor: savings >= wish.cost ? "pointer" : "not-allowed",
                    }}
                    onClick={() =>
                      savings >= wish.cost ? handleDelete(index) : null
                    }
                  >
                    <h3>Wish: {wish.wish}</h3>
                    <p>Cost: €{wish.cost}</p>
                    <img
                      src={wish.image}
                      alt={wish.wish}
                      style={{ width: "100px", height: "auto" }}
                    />
                  </div>
                ))}
                <br />
              </div>
            ) : (
              <label style={{ backgroundColor: "#ffffff", fontSize: "20px" }}>
                No wishes available.
              </label>
            )}
          </div>
        </div>
      )}

      {currentView === "SelectionScreen" && (
        <div className="container-fluid">
          <div style={{ backgroundColor: "#ffffff" }}>
            Select your next wish...
          </div>
          <div>
            {categories.map((category, index) => (
              <div key={index} className="Add_Dreamboard">
                <img
                  src={category.image}
                  alt={category.name}
                  style={{ width: "15vw", height: "auto" }}
                />
                <img
                  src={plus}
                  alt="Plus Button"
                  style={{
                    cursor: "pointer",
                    width: "4vw",
                    height: "auto",
                    marginLeft: "10px",
                  }}
                  onClick={() => handleImageSelect(category.image)}
                />
                <h1>{category.name}</h1>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === "CostAssigner" && (
        <div>
          <label style={{ backgroundColor: "#ffffff" }}>
            Allocate the Cost:
          </label>
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Selected Wish Category"
              style={{
                marginTop: "20px",
                marginBottom: "20px",
                marginLeft: "20px",
              }}
            />
          ) : (
            <p>No image selected.</p>
          )}
          <br />
          <label htmlFor="wish" style={{ backgroundColor: "#ffffff" }}>
            What's your Wish?
          </label>
          <input
            type="text"
            id="wish"
            className="Input_box"
            value={wishData}
            onChange={(e) => setWishData(e.target.value)}
            placeholder="Enter Wish"
          />
          <br />
          <label htmlFor="cost" style={{ backgroundColor: "#ffffff" }}>
            Cost (EUR):
          </label>
          <input
            type="number"
            id="cost"
            className="Input_box"
            value={costData}
            onChange={(e) => setCostData(Number(e.target.value))}
            placeholder="Enter Cost"
          />
          <br />
          <button className="button" onClick={handleSubmit}>
            Submit
          </button>
          <br />
        </div>
      )}
    </div>
  );
};

export default DreamBoardPage;
