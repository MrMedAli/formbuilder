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
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService'; // Import your auth service
import { parseJwt } from '../utils/jwtUtils';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault'; // Import icon for disabling

const FillForms = ({ onClose }) => {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [formStructure, setFormStructure] = useState([]);
  const [formData, setFormData] = useState({});
  const [preset, setPreset] = useState({});
  const navigate = useNavigate();

  // Fetch forms on component mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/formulaires/');
        setForms(response.data);
      } catch (error) {
        console.error('Error fetching forms', error);
      }
    };

    fetchForms();
  }, []);

  // Fetch form structure whenever a form is selected
  useEffect(() => {
    const fetchFormStructure = async () => {
      if (selectedFormId) {
        try {
          const response = await axios.get(`http://localhost:8001/api/formulaires/${selectedFormId}/`);
          const form = response.data;
          // Add a disabled field property if it doesn't exist
          const updatedFields = form.fields.map(field => ({
            ...field,
            disabled: field.disabled || false,
          }));
          setFormStructure(updatedFields);

          // Initialize formData with default values
          const initialData = initializeFormData(updatedFields);
          setFormData(initialData);
        } catch (error) {
          console.error('Error fetching form structure', error);
        }
      }
    };

    fetchFormStructure();
  }, [selectedFormId]);

  // Initialize form data with empty values
  const initializeFormData = (fields) => {
    const data = {};
    fields.forEach((field) => {
      if (field.type === 'object') {
        data[field.name] = initializeFormData(field.fields); // Recursively initialize nested objects
      } else {
        data[field.name] = ''; // Initialize other fields with empty strings
      }
    });
    return data;
  };

  // Handle field change for simple fields
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle field change for object fields (nested fields)
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

  // Toggle field disabled state
  const toggleFieldDisabled = (fieldName) => {
    setFormStructure((prevFields) =>
      prevFields.map((field) =>
        field.name === fieldName ? { ...field, disabled: !field.disabled } : field
      )
    );
  };

  // Render individual fields, including object fields
  const renderField = (field) => {
    if (field.type === 'object') {
      return (
        <div key={field.name} style={{ paddingLeft: '20px' }}>
          <Typography variant="h6">{field.name}</Typography>
          {field.fields.map((subField) => (
            <div key={subField.name} style={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label={subField.name}
                name={subField.name}
                type={subField.type}
                value={formData[field.name]?.[subField.name] || ''}
                onChange={(e) => handleObjectFieldChange(field.name, e)}
                fullWidth
                margin="normal"
                disabled={subField.disabled} // Disable based on field's disabled state
              />
              <IconButton onClick={() => toggleFieldDisabled(subField.name)}>
                <DisabledByDefaultIcon color={subField.disabled ? 'action' : 'error'} />
              </IconButton>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div key={field.name} style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          label={field.name}
          name={field.name}
          type={field.type}
          value={formData[field.name] || ''}
          onChange={handleFieldChange}
          fullWidth
          margin="normal"
          disabled={field.disabled} // Disable based on field's disabled state
        />
        <IconButton onClick={() => toggleFieldDisabled(field.name)}>
          <DisabledByDefaultIcon color={field.disabled ? 'action' : 'error'} />
        </IconButton>
      </div>
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      const userData = parseJwt(user.access);

      // Filter out disabled fields from formData
      const filteredFormData = filterDisabledFields(formStructure, formData);

      const payload = {
        form: selectedFormId,
        user: userData.user_id, // Use the user ID from the token
        response_data: filteredFormData,
      };

      console.log('Submitting form data:', payload); // Verify payload

      const response = await axios.post(`http://localhost:8001/api/form-responses/`, payload, {
        headers: authService.getAuthHeader(), // Include authorization header
      });
      setPreset(response.data); // Update preset with the response data

      alert('Form submitted successfully');
      // Close the form and navigate to PresetManager
      onClose();
      navigate('/admin/presets');
      window.location.reload(); // Refresh the whole page after saving
    } catch (error) {
      console.error('Error submitting form', error);
      if (error.response) {
        console.log('Error response:', error.response.data); // Log detailed error response
      }
    }
  };

  // Filter out disabled fields from formData
  const filterDisabledFields = (fields, data) => {
    const filteredData = {};
    fields.forEach((field) => {
      if (field.disabled) return; // Skip disabled fields

      if (field.type === 'object') {
        filteredData[field.name] = filterDisabledFields(field.fields, data[field.name] || {});
      } else {
        filteredData[field.name] = data[field.name];
      }
    });
    return filteredData;
  };

  // Log the preset object for debugging
  useEffect(() => {
    console.log('preset', preset);
  }, [preset]);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Fill a Form
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="select-form-label">Select a Form</InputLabel>
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
