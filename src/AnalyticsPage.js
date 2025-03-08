import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./AnalyticsPage.css";
import CS385_project_LOGO from "./CS385-project-LOGO.png";
//importing from firestore
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { app, db } from "./firebaseConfiguration"; // Firebase config import
// importing chartjs elements
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

// registering Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

// function for date sel.
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return "${day}-${month}-${year}";
};

// Chart.js for a pink background
const pinkBackgroundPlugin = {
  id: "pinkBackground",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    const { width, height } = chart;
    ctx.save();
    ctx.fillStyle = "#FFCCCC";
    ctx.fillRect(0, 0, width, height); // Fill the background
    ctx.restore();
  },
};

//the graph
const UserInputGraph = () => {
  const [user, setUser] = useState(null); //setting user state
  const [activityLog, setActivityLog] = useState([]); //log for any user activity
  const [chartData, setChartData] = useState({
    //setting data for display
    labels: [],
    datasets: [
      {
        label: "Spent",
        data: [],
        borderColor: "#bf047a",
        backgroundColor: "#e880c2",
        pointBackgroundColor: "#f52cab",
        pointBorderColor: "#f52cab",
        borderWidth: 2,
        pointRadius: 5,
      },
      {
        label: "Budget",
        data: [],
        borderColor: "#054f06",
        backgroundColor: "#76f578",
        pointBackgroundColor: "#054f06",
        pointBorderColor: "#76f578",
        borderWidth: 2,
        pointRadius: 5,
      },
    ],
  });
  //progress data graph
  const [progressData, setProgressData] = useState({
    labels: [],
    datasets: [
      {
        label: "Progress (%)",
        data: [],
        backgroundColor: "##76f578",
        borderColor: "#038005",
        borderWidth: 2,
        barPercentage: 0.5, // Make the bars thinner
        categoryPercentage: 0.5,
      },
    ],
  });

  const auth = getAuth(app);
  const dbInstance = getFirestore(app); //using db from firestore

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      //when the user signs in
      if (currentUser) {
        //if theres a user signed
        setUser(currentUser); //this user set to current

        const userDocRef = doc(dbInstance, "users", currentUser.uid); //creating ref to firestore doc for current user
        const userDoc = await getDoc(userDocRef); //fetching users doc from firestore

        if (userDoc.exists()) {
          const userData = userDoc.data(); //if doc exists extract the data
          //extract necessary data - use default if properties are missing
          const { graphData = [], budgetGoals = {} } = userData;
          //read the data to calculate for budget
          const dailyData = graphData.reduce((acc, entry) => {
            const date = formatDate(entry.date); //readable format
            if (!acc[date]) {
              //initialize data if not already
              acc[date] = { spent: 0, budget: 0 };
            }
            //incrementing the spending and budget totals for the date
            acc[date].spent += entry.amount;
            acc[date].budget += budgetGoals[entry.category] || 0;
            return acc; //returning for next i
          }, {}); //empty obj

          const dates = Object.keys(dailyData); //extracting dates from dailydata keys
          const spentAmounts = dates.map((date) => dailyData[date].spent); //map dates
          const budgetedAmounts = dates.map((date) => dailyData[date].budget);
          const progress = dates.map((date) => {
            const spent = dailyData[date].spent; //spent amount for day
            const budget = dailyData[date].budget; //budget
            return budget > 0 ? Math.min((spent / budget) * 100, 100) : 0; //calculating progress as a percentage
          });

          setActivityLog(graphData); //update activity log state with graph data
          setChartData({
            labels: dates, //set chart labels as dates
            datasets: [
              {
                label: "Spent",
                data: spentAmounts,
                borderColor: "#FF6384",
                fill: false, // Line chart, no fill
                tension: 0.1, // Smooth line
              },
              {
                label: "Budget",
                data: budgetedAmounts,
                borderColor: "#36A2EB",
                fill: false,
                tension: 0.1,
              },
            ],
          });

          setProgressData({
            labels: dates,
            datasets: [
              {
                label: "Progress (%)",
                data: progress,
                backgroundColor: "#ffcc00", // Yellow for progress bar
              },
            ],
          });
        } else {
          await updateDoc(userDocRef, { graphData: [], budgetGoals: {} }); //firestore db initializing
        }
      } else {
        setUser(null); //once user logs out -clear the state
      }
    });

    return () => unsubscribe(); //clear Authstatechanged
  }, [auth, dbInstance]);

  const handleSubmit = async (e) => {
    e.preventDefault(); //default form subm
    const date = e.target.date.value; //get date input
    const value = parseFloat(e.target.value.value); //get and parse numeric value input
    const category = e.target.category.value; //get category input

    if (!date || isNaN(value) || !category) {
      //validating input
      alert("Please enter valid inputs."); //error
      return; //exiting
    }

    const newActivity = { date, amount: value, category }; //new activity obj

    setActivityLog((prevLog) => [...prevLog, newActivity]); //updating activity log state

    if (user) {
      const userDocRef = doc(dbInstance, "users", user.uid); //connect to user fb
      await updateDoc(userDocRef, {
        graphData: arrayUnion(newActivity), //append
      });

      const userDoc = await getDoc(userDocRef); //wait for updated doc
      const userData = userDoc.data(); //extract data
      const { graphData = [], budgetGoals = {} } = userData; //set default

      const dailyData = graphData.reduce((acc, entry) => {
        const date = formatDate(entry.date);
        if (!acc[date]) {
          acc[date] = { spent: 0, budget: 0 }; //initializing obj
        }
        acc[date].spent += entry.amount; //add spent amounts
        acc[date].budget += budgetGoals[entry.category] || 0; //budget amounts
        return acc; //return total
      }, {});

      const dates = Object.keys(dailyData); //extract dates from data
      const spentAmounts = dates.map((date) => dailyData[date].spent); //map
      const budgetedAmounts = dates.map((date) => dailyData[date].budget);
      const progress = dates.map((date) => {
        const spent = dailyData[date].spent;
        const budget = dailyData[date].budget;
        return budget > 0 ? Math.min((spent / budget) * 100, 100) : 0; //calculating progress
      });

      setChartData({
        labels: dates,
        datasets: [
          {
            label: "Spent",
            data: spentAmounts,
            borderColor: "#FF6384",
            fill: false, // Line chart, no fill
            tension: 0.1,
          },
          {
            label: "Budget",
            data: budgetedAmounts,
            borderColor: "#36A2EB",
            fill: false,
            tension: 0.1,
          },
        ],
      });

      setProgressData({
        labels: dates,
        datasets: [
          {
            label: "Progress (%)",
            data: progress,
            backgroundColor: "#ffcc00", // Yellow for progress bar
          },
        ],
      });
    }

    e.target.reset();
  };
  //return statement

  return (
    <div className="UserInputGraph">
      <header>
        <img src={CS385_project_LOGO} alt="Logo" className="Logo" />
        <h1 className="KK_header">KashKeeper</h1>
      </header>
      <div className="container">
        <h2>User Analytics</h2>
        {user ? (
          <>
            <form onSubmit={handleSubmit} className="form">
              <label>
                Date:
                <input
                  type="date"
                  name="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </label>
              <label>
                Money Spent:
                <input type="number" name="value" step="0.01" required />
              </label>
              <button type="submit">Add Data</button>
            </form>

            {/* Line Chart: Spending vs. Budget */}
            <div className="chart-container">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, position: "top" },
                    title: { display: true, text: "Daily Budget vs. Spending" },
                  },
                  //x and y axis
                  scales: {
                    x: { title: { display: true, text: "Date" } },
                    y: { title: { display: true, text: "Amount (€)" } },
                  },
                }}
                plugins={[pinkBackgroundPlugin]} // Add the custom plugin here
              />
            </div>

            {/* Row Chart (Horizontal Bar): Progress */}
            <div className="chart-container">
              <Bar
                data={progressData}
                options={{
                  responsive: true,
                  indexAxis: "y", // Switch to horizontal bar chart
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: "Daily Budget Progress" },
                  },
                  scales: {
                    x: {
                      title: { display: true, text: "Progress (%)" },
                      max: 100,
                    },
                    y: { title: { display: true, text: "Date" } },
                  },
                }}
                plugins={[pinkBackgroundPlugin]} //background colour
              />
            </div>
          </>
        ) : (
          <p>Please log in to track your budget and spending.</p>
        )}
      </div>
    </div>
  );
};

export default UserInputGraph;
