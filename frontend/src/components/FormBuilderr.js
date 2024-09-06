// FormBuilderr.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NestedField from './NestedField';
import { Button, TextField, Typography, Paper, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
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
        const response = await axios.get('http://localhost:8000/api/formulaires/');
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

  const saveForm = async () => {
    try {
      await axios.post('http://localhost:8000/api/formulaires/', form);
      alert('Formulaire enregistré avec succès');
      const response = await axios.get('http://localhost:8000/api/formulaires/');
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
      await axios.delete(`http://localhost:8000/api/formulaires/${formId}/`);
      alert('Formulaire supprimé avec succès');
      const response = await axios.get('http://localhost:8000/api/formulaires/');
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
        Création de Formulaire
      </Typography>
      <TextField
        label="Nom du formulaire"
        variant="outlined"
        fullWidth
        margin="normal"
        value={form.nom}
        onChange={e => setForm({ ...form, nom: e.target.value })}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => addField({ name: 'Champ Exemple', type: 'string', fields: [] })}
        style={{ marginBottom: '20px' }}
      >
        Ajouter Champ
      </Button>
      {form.fields.map((field, index) => (
        <NestedField
          key={index}
          field={field}
          onUpdate={(updatedField) => handleFieldUpdate(index, updatedField)}
        />
      ))}
      <Button
        variant="contained"
        color="secondary"
        onClick={saveForm}
        style={{ marginTop: '20px' }}
      >
        Enregistrer
      </Button>
      <br />
      <Link to="/formulaires" style={{ marginTop: '20px', display: 'block' }}>
        Voir la liste des formulaires
      </Link>
      <Paper style={{ marginTop: '20px', padding: '10px' }}>
        <Typography variant="h6" gutterBottom>
          Liste des Formulaires
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
