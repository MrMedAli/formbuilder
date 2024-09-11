import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from '../config';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import authService from '../services/authService';

const cardStyle = {
  width: '100%',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
};

const FormTemplates = () => {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredForms(forms.filter((form) =>
        form.id.toString().includes(searchTerm) || form.nom.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredForms(forms);
    }
  }, [searchTerm, forms]);

  const fetchForms = async () => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get(`${apiUrl}/api/formulaires/`, { headers });
      setForms(response.data);
      setFilteredForms(response.data);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (form) => {
    setSelectedForm(form);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedForm(null);
    setOpenDialog(false);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const renderFields = (fields) => {
    if (!fields) return null;

    return (
      <Box sx={{ p: 2 }}>
        {fields.map((field, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="body1">
              <strong>{field.name || `Field ${index + 1}`}:</strong> {field.type}
            </Typography>
            {field.type === 'object' && field.fields && (
              <Box sx={{ ml: 2 }}>
                {Object.entries(field.fields).map(([nestedKey, nestedValue], nestedIndex) => (
                  <Box key={nestedIndex} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{nestedKey}:</strong> {JSON.stringify(nestedValue)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            <Divider />
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Form Templates
      </Typography>
      <TextField
        label="Search by Form ID or Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      {loading ? (
        <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
      ) : (
        <Grid container spacing={2}>
          {filteredForms.map((form) => (
            <Grid item xs={12} sm={6} md={4} key={form.id}>
              <Card style={cardStyle} onClick={() => handleOpenDialog(form)}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {form.nom}
                  </Typography>
                  <Chip label={`ID: ${form.id}`} variant="outlined" />
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                  <IconButton onClick={() => handleOpenDialog(form)}>
                    <VisibilityIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Form Details</DialogTitle>
        <DialogContent>
          {selectedForm && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedForm.nom}
              </Typography>
              {renderFields(selectedForm.fields)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormTemplates;
