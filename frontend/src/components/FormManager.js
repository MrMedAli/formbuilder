import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import authService from "../services/authService";

const API_URL = "http://localhost:8000/api/forms/";

const FormManager = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [title, setTitle] = useState("");
  const [formStructure, setFormStructure] = useState("");

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: authService.getAuthHeader(),
      });
      setForms(response.data);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = {
        title,
        form_structure: JSON.parse(formStructure),
      };
      if (selectedForm) {
        await axios.put(`${API_URL}${selectedForm.id}/`, formData, {
          headers: authService.getAuthHeader(),
        });
      } else {
        await axios.post(API_URL, formData, {
          headers: authService.getAuthHeader(),
        });
      }
      fetchForms();
      setSelectedForm(null);
      setTitle("");
      setFormStructure("");
    } catch (error) {
      console.error("Failed to save form:", error);
    }
  };

  const handleDelete = async (formId) => {
    try {
      await axios.delete(`${API_URL}${formId}/`, {
        headers: authService.getAuthHeader(),
      });
      fetchForms();
    } catch (error) {
      console.error("Failed to delete form:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Form Manager
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Form Structure (JSON)"
            value={formStructure}
            onChange={(e) => setFormStructure(e.target.value)}
            required
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary">
            {selectedForm ? "Update Form" : "Create Form"}
          </Button>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Existing Forms
      </Typography>
      <List>
        {forms.map((form) => (
          <ListItem
            key={form.id}
            secondaryAction={
              <Box>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => {
                    setSelectedForm(form);
                    setTitle(form.title);
                    setFormStructure(
                      JSON.stringify(form.form_structure, null, 2)
                    );
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(form.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText primary={form.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FormManager;
