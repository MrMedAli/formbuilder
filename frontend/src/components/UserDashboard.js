import React, { useState } from "react";
import { Typography, Grid, Paper, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadarController,
  RadialLinearScale,
} from "chart.js";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css'; // Import the CSS for react-calendar

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadarController,
  RadialLinearScale
);

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

// Sample data for charts
const lineChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Monthly Sales",
      data: [30, 45, 35, 50, 60, 70, 85],
      borderColor: "#42A5F5",
      backgroundColor: "rgba(66, 165, 245, 0.2)",
      fill: true,
    },
  ],
};

const barChartData = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "Quantity",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

const doughnutChartData = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      label: "Votes",
      data: [300, 50, 100],
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
    },
  ],
};

const UserDashboard = () => {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        User Dashboard
      </Typography>

      {/* Calendar and Charts Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Item sx={{ height: 555, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h5" mb={2}>Calendar</Typography>
            <Calendar
              onChange={handleDateChange}
              value={date}
              style={{ maxWidth: "100%", margin: "0 auto", height: '100%', width: '100%' }}
            />
          </Item>
        </Grid>
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h5" mb={2}>Doughnut Chart</Typography>
            <Doughnut data={doughnutChartData} />
          </Item>
        </Grid>
      </Grid>

      {/* Line and Bar Charts Section */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Performance Charts
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Item>
              <Typography variant="h6">Line Chart</Typography>
              <Line data={lineChartData} />
            </Item>
          </Grid>
          <Grid item xs={12} md={6}>
            <Item>
              <Typography variant="h6">Bar Chart</Typography>
              <Bar data={barChartData} />
            </Item>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default UserDashboard;
