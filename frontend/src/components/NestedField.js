import React, { useState } from 'react';
import { TextField, Button, MenuItem, Paper, Typography, Divider } from '@mui/material';

const NestedField = ({ field, onUpdate }) => {
  const [nestedFields, setNestedFields] = useState(field.fields || []);

  const addNestedField = () => {
    const newField = { name: '', type: 'string' }; // Default new field
    setNestedFields(prevFields => [...prevFields, newField]);
    onUpdate({ ...field, fields: [...nestedFields, newField] });
  };

  const updateNestedField = (index, updatedField) => {
    const updatedFields = nestedFields.map((f, i) => (i === index ? updatedField : f));
    setNestedFields(updatedFields);
    onUpdate({ ...field, fields: updatedFields });
  };

  return (
    <Paper style={{ padding: '10px', marginBottom: '10px' }}>
      <Typography variant="h6" gutterBottom>
        {field.name} ({field.type})
      </Typography>
      {field.type === 'object' && (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={addNestedField}
            style={{ marginBottom: '10px' }}
          >
            Ajouter Champ dans Objet
          </Button>
          {nestedFields.map((nestedField, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <TextField
                label="Nom du champ"
                variant="outlined"
                fullWidth
                margin="normal"
                value={nestedField.name}
                onChange={(e) => updateNestedField(index, { ...nestedField, name: e.target.value })}
              />
              <TextField
                select
                label="Type"
                variant="outlined"
                fullWidth
                margin="normal"
                value={nestedField.type}
                onChange={(e) => updateNestedField(index, { ...nestedField, type: e.target.value })}
              >
                <MenuItem value="string">String</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="object">Object</MenuItem>
              </TextField>
            </div>
          ))}
        </>
      )}
      <TextField
        label="Nom du champ"
        variant="outlined"
        fullWidth
        margin="normal"
        value={field.name}
        onChange={(e) => onUpdate({ ...field, name: e.target.value })}
      />
      <TextField
        select
        label="Type"
        variant="outlined"
        fullWidth
        margin="normal"
        value={field.type}
        onChange={(e) => onUpdate({ ...field, type: e.target.value })}
      >
        <MenuItem value="string">String</MenuItem>
        <MenuItem value="number">Number</MenuItem>
        <MenuItem value="object">Object</MenuItem>
      </TextField>
    </Paper>
  );
};

export default NestedField;
