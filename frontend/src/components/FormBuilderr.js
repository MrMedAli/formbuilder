import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NestedField from './NestedField';
import { Button, TextField, Typography, Paper, List, ListItem, ListItemText, Divider, IconButton, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

const FormBuilderr = () => {
  const [form, setForm] = useState({ nom: '', fields: [] });
  const [formsList, setFormsList] = useState([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/formulaires/');
        setFormsList(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des formulaires', error);
      }
    };
    fetchForms();
  }, []);

  const addField = (field) => {
    setForm(prevForm => ({
      ...prevForm,
      fields: [...prevForm.fields, field]
    }));
  };

  const handleFieldUpdate = (index, updatedField) => {
    const updatedFields = form.fields.map((f, i) => (i === index ? updatedField : f));
    setForm({ ...form, fields: updatedFields });
  };

  const handleFieldRemove = (index) => {
    const updatedFields = form.fields.filter((_, i) => i !== index);
    setForm({ ...form, fields: updatedFields });
  };

  const saveForm = async (event) => {
    event.preventDefault(); // Prevent default behavior
    try {
      await axios.post('http://localhost:8001/api/formulaires/', form);
      alert('Formulaire enregistré avec succès');
      const response = await axios.get('http://localhost:8001/api/formulaires/');
      setFormsList(response.data);
    } catch (error) {
      if (error.response) {
        console.error('Erreur lors de l\'enregistrement du formulaire', error.response.data);
      } else {
        console.error('Erreur lors de l\'enregistrement du formulaire', error.message);
      }
    }
  };

  const deleteForm = async (formId) => {
    try {
      await axios.delete(`http://localhost:8001/api/formulaires/${formId}/`);
      alert('Formulaire supprimé avec succès');
      const response = await axios.get('http://localhost:8001/api/formulaires/');
      setFormsList(response.data);
    } catch (error) {
      if (error.response) {
        console.error('Erreur lors de la suppression du formulaire', error.response.data);
      } else {
        console.error('Erreur lors de la suppression du formulaire', error.message);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Form Creation
      </Typography>
      <TextField
        label="Form Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={form.nom}
        onChange={e => setForm({ ...form, nom: e.target.value })}
      />
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => addField({ name: 'Champ Exemple', type: 'string', fields: [] })}
            style={{ marginRight: '20px' }} // Adjust margin as needed
          >
            Add Field
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={saveForm}
            type="button" // Ensure the button does not trigger form submission
          >
            Save
          </Button>
        </Box>

        <Box mt={2}>
          {form.fields.map((field, index) => (
            <Box key={index} mb={2} p={2} border={1} borderColor="grey.300" borderRadius={1}>
              <NestedField
                field={field}
                onUpdate={(updatedField) => handleFieldUpdate(index, updatedField)}
              />
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleFieldRemove(index)}
                color="error"
                style={{ float: 'right' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
      <br />

      <Paper style={{ marginTop: '20px', padding: '10px' }}>
        <Typography variant="h6" gutterBottom>
          Forms List
        </Typography>
        <List>
          {formsList.map(formItem => (
            <div key={formItem.id}>
              <ListItem>
                <ListItemText primary={formItem.nom} />
                <IconButton
                  edge="end"
                  aria-label="view"
                  component={Link}
                  to={`/formulaires/${formItem.id}`}
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  component={Link}
                  to={`/formulaires/edit/${formItem.id}`}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => deleteForm(formItem.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
      </Paper>
    </div>
  );
};

export default FormBuilderr;
