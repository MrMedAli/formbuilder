import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService'; // Import your auth service

const FillForms = () => {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [formStructure, setFormStructure] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/formulaires/');
        setForms(response.data);
      } catch (error) {
        console.error('Error fetching forms', error);
      }
    };

    fetchForms();
  }, []);

  useEffect(() => {
    const fetchFormStructure = async () => {
      if (selectedFormId) {
        try {
          const response = await axios.get(`http://localhost:8000/api/formulaires/${selectedFormId}/`);
          const form = response.data;
          setFormStructure(form.fields);

          // Initialize formData with default values
          const initialData = initializeFormData(form.fields);
          setFormData(initialData);
        } catch (error) {
          console.error('Error fetching form structure', error);
        }
      }
    };

    fetchFormStructure();
  }, [selectedFormId]);

  const initializeFormData = (fields) => {
    const data = {};
    fields.forEach((field) => {
      if (field.type === 'object') {
        data[field.name] = initializeFormData(field.fields);
      } else {
        data[field.name] = '';
      }
    });
    return data;
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleObjectFieldChange = (fieldName, e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [fieldName]: {
        ...formData[fieldName],
        [name]: value,
      },
    });
  };

  const renderField = (field) => {
    if (field.type === 'object') {
      return (
        <div key={field.name} style={{ paddingLeft: '20px' }}>
          <Typography variant="h6">{field.name}</Typography>
          {field.fields.map((subField) => (
            <TextField
              key={subField.name}
              label={subField.name}
              name={subField.name}
              type={subField.type}
              value={formData[field.name]?.[subField.name] || ''}
              onChange={(e) => handleObjectFieldChange(field.name, e)}
              fullWidth
              margin="normal"
            />
          ))}
        </div>
      );
    }
    return (
      <TextField
        key={field.name}
        label={field.name}
        name={field.name}
        type={field.type}
        value={formData[field.name] || ''}
        onChange={handleFieldChange}
        fullWidth
        margin="normal"
      />
    );
  };

  const handleSubmit = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const payload = {
        form: selectedFormId,
        user: user.id, // Use the user ID from authService
        response_data: formData,
      };

      console.log('Submitting form data:', payload); // Verify payload

      await axios.post(`http://localhost:8000/api/form-responses/${selectedFormId}/submit/`, payload, {
        headers: authService.getAuthHeader(), // Include authorization header
      });

      alert('Form submitted successfully');
      navigate('/formulaires');
    } catch (error) {
      console.error('Error submitting form', error);
      console.log('Error response:', error.response.data); // Log detailed error response
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Fill a Form
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="select-form-label">Sélectionner un formulaire</InputLabel>
        <Select
          labelId="select-form-label"
          value={selectedFormId}
          onChange={(e) => setSelectedFormId(e.target.value)}
        >
          {forms.map((form) => (
            <MenuItem key={form.id} value={form.id}>
              {form.nom}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {formStructure.length > 0 && (
        <Paper style={{ padding: '20px' }}>
          {formStructure.map(renderField)}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginTop: '20px' }}
          >
            Submit
          </Button>
        </Paper>
      )}
    </div>
  );
};

export default FillForms;
