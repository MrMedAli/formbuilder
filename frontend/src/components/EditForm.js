// EditForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import NestedField from './NestedField';

const EditForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState({ nom: '', fields: [] });
  const [formLoading, setFormLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/formulaires/${id}/`);
        setForm(response.data);
        setFormLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération du formulaire', error);
      }
    };
    fetchForm();
  }, [id]);

  const handleFieldUpdate = (index, updatedField) => {
    const updatedFields = form.fields.map((f, i) => (i === index ? updatedField : f));
    setForm({ ...form, fields: updatedFields });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:8000/api/formulaires/${id}/`, form);
      alert('Formulaire mis à jour avec succès');
      window.location.reload(); // Reload the current page
    } catch (error) {
      if (error.response) {
        console.error('Erreur lors de la mise à jour du formulaire', error.response.data);
      } else {
        console.error('Erreur lors de la mise à jour du formulaire', error.message);
      }
    }
  };

  if (formLoading) return <Typography>Chargement...</Typography>;

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Édition du Formulaire
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
        onClick={() => setForm(prevForm => ({
          ...prevForm,
          fields: [...prevForm.fields, { name: 'Champ Exemple', type: 'string', fields: [] }]
        }))}
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
        onClick={handleSave}
        style={{ marginTop: '20px' }}
      >
        Enregistrer
      </Button>
    </div>
  );
};

export default EditForm;
