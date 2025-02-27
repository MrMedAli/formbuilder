import React from "react";
import { Typography, Grid, Paper, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const AdminDashboard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">100</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Typography variant="h6">Total Forms</Typography>
            <Typography variant="h4">50</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Typography variant="h6">Active Forms</Typography>
            <Typography variant="h4">30</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <Typography variant="h6">Form Submissions</Typography>
            <Typography variant="h4">500</Typography>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
