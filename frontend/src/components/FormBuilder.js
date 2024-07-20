import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const API_URL = 'http://localhost:8000/api/forms/';

const fieldTypes = ['string', 'number', 'object', 'array'];

const FormBuilder = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get(API_URL, { headers });
      setForms(response.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate('/');
      } else {
        console.error('Failed to fetch forms:', error);
      }
    }
  }

  const addField = (fields, setFields) => {
    setFields([...fields, { name: '', type: 'string', fields: [], itemType: 'string' }]);
  };

  const removeField = (index, fields, setFields) => {
    const newFormFields = fields.filter((_, i) => i !== index);
    setFields(newFormFields);
  };

  const handleFieldChange = (index, field, fields, setFields) => {
    const newFormFields = [...fields];
    newFormFields[index] = field;
    setFields(newFormFields);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      title,
      form_structure: formFields.reduce((acc, field) => {
        if (field.type === 'object') {
          acc[field.name] = buildNestedFields(field.fields);
        } else if (field.type === 'array') {
          acc[field.name] = { type: 'array', items: field.itemType === 'object' ? buildNestedFields(field.fields) : field.itemType };
        } else {
          acc[field.name] = field.type;
        }
        return acc;
      }, {}),
    };

    try {
      const headers = authService.getAuthHeader();
      if (selectedForm) {
        await axios.put(`${API_URL}${selectedForm.id}/`, formData, { headers });
      } else {
        await axios.post(API_URL, formData, { headers });
      }
      fetchForms();
      setSelectedForm(null);
      setTitle('');
      setFormFields([]);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate('/');
      } else {
        console.error('Failed to save form:', error);
      }
    }
  };

  const handleDelete = async (formId) => {
    try {
      const headers = authService.getAuthHeader();
      console.log('Deleting form with headers:', headers);  // Log the headers
      await axios.delete(`${API_URL}${formId}/`, { headers });
      fetchForms();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Redirect to login if unauthorized
        navigate('/');
      } else {
        console.error('Failed to delete form:', error);
      }
    }
  };

  const buildNestedFields = (fields) => {
    return fields.reduce((acc, field) => {
      if (field.type === 'object') {
        acc[field.name] = buildNestedFields(field.fields);
      } else if (field.type === 'array') {
        acc[field.name] = { type: 'array', items: field.itemType === 'object' ? buildNestedFields(field.fields) : field.itemType };
      } else {
        acc[field.name] = field.type;
      }
      return acc;
    }, {});
  };

  const renderFields = (fields, setFields) => {
    return fields.map((field, index) => (
      <div key={index} style={{ marginLeft: '20px' }}>
        <input
          placeholder="Field name"
          value={field.name}
          onChange={(e) => handleFieldChange(index, { ...field, name: e.target.value }, fields, setFields)}
          required
        />
        <select
          value={field.type}
          onChange={(e) => handleFieldChange(index, { ...field, type: e.target.value, fields: [], itemType: 'string' }, fields, setFields)}
        >
          {fieldTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button type="button" onClick={() => removeField(index, fields, setFields)}>Remove</button>
        {field.type === 'object' && (
          <div>
            <button type="button" onClick={() => addField(field.fields, (newFields) => handleFieldChange(index, { ...field, fields: newFields }, fields, setFields))}>Add Nested Field</button>
            {renderFields(field.fields, (newFields) => handleFieldChange(index, { ...field, fields: newFields }, fields, setFields))}
          </div>
        )}
        {field.type === 'array' && (
          <div>
            <select
              value={field.itemType}
              onChange={(e) => handleFieldChange(index, { ...field, itemType: e.target.value, fields: [] }, fields, setFields)}
            >
              {fieldTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {field.itemType === 'object' && (
              <div>
                <button type="button" onClick={() => addField(field.fields, (newFields) => handleFieldChange(index, { ...field, fields: newFields }, fields, setFields))}>Add Nested Field</button>
                {renderFields(field.fields, (newFields) => handleFieldChange(index, { ...field, fields: newFields }, fields, setFields))}
              </div>
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div>
      <h2>Form Builder</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Fields:</label>
          {renderFields(formFields, setFormFields)}
          <button type="button" onClick={() => addField(formFields, setFormFields)}>Add Field</button>
        </div>
        <button type="submit">Save Form</button>
      </form>

      <h3>Existing Forms</h3>
      <ul>
        {forms.map((form) => (
          <li key={form.id}>
            {form.title}
            <button onClick={() => {
              setSelectedForm(form);
              setTitle(form.title);
              setFormFields(Object.keys(form.form_structure).map((key) => {
                const value = form.form_structure[key];
                if (typeof value === 'object' && !Array.isArray(value) && value.type === 'array') {
                  return {
                    name: key,
                    type: 'array',
                    itemType: typeof value.items === 'object' ? 'object' : value.items,
                    fields: typeof value.items === 'object'
                      ? Object.keys(value.items).map((nestedKey) => ({
                        name: nestedKey,
                        type: value.items[nestedKey],
                        fields: []
                      }))
                      : []
                  };
                }
                return {
                  name: key,
                  type: typeof value === 'object' && !Array.isArray(value) ? 'object' : value,
                  fields: typeof value === 'object' && !Array.isArray(value)
                    ? Object.keys(value).map((nestedKey) => ({
                      name: nestedKey,
                      type: value[nestedKey],
                      fields: []
                    }))
                    : []
                };
              }));
            }}>Edit</button>
            <button onClick={() => handleDelete(form.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormBuilder;
