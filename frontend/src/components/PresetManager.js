import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Grid,
  Button,
  Modal,
  TextField,
  Paper,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import authService from "../services/authService";

const API_URL = "http://localhost:8000/api/forms/";

const PresetManager = () => {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [title, setTitle] = useState("");
  const [formStructure, setFormStructure] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    // Filter forms based on the filterText
    const filtered = forms.filter((form) =>
      form.title.toLowerCase().includes(filterText.toLowerCase())
    );
    setFilteredForms(filtered);
  }, [filterText, forms]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: authService.getAuthHeader(),
      });
      setForms(response.data);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
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
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formId) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}${formId}/`, {
        headers: authService.getAuthHeader(),
      });
      fetchForms();
    } catch (error) {
      console.error("Failed to delete form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (form) => {
    setSelectedForm(form);
    setTitle(form.title);
    setFormStructure(JSON.stringify(form.form_structure, null, 2));
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setSelectedForm(null);
    setTitle("");
    setFormStructure("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Presets
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Filter by Title"
            variant="outlined"
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{ mb: 0 }}
          />
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            <AddIcon /> Create
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredForms.map((form) => (
            <Grid item xs={12} sm={6} md={4} key={form.id}>
              <Card
                sx={{
                  mb: 2,
                  boxShadow: 3,
                  borderRadius: 2,
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'scale(1.02)',
                    bgcolor: 'primary.light',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {form.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {JSON.stringify(form.form_structure, null, 2)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton aria-label="edit" onClick={() => handleEditClick(form)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDelete(form.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            p: 3,
            bgcolor: "background.paper",
            margin: "auto",
            maxWidth: 500,
            mt: 10,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Paper sx={{ p: 2 }}>
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
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={loading}
                sx={{ 
                  ':hover': {
                    bgcolor: 'primary.dark', 
                    transition: 'background-color 0.3s'
                  } 
                }}
              >
                {loading ? <CircularProgress size={24} /> : (selectedForm ? "Update Form" : "Create Form")}
              </Button>
            </form>
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};

export default PresetManager;
