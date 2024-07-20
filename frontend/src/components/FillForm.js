import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const FillForm = () => {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [form, setForm] = useState(null);
  const [response, setResponse] = useState({});
  const [savedResponses, setSavedResponses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      fetchForm(selectedFormId);
    }
  }, [selectedFormId]);

  const fetchForms = async () => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get('http://localhost:8000/api/forms/', { headers });
      setForms(response.data);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
      if (error.response && error.response.status === 403) {
        navigate('/');
      }
    }
  };

  const fetchForm = async (formId) => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get(`http://localhost:8000/api/forms/${formId}/`, { headers });
      setForm(response.data);
      setResponse(Object.keys(response.data.form_structure).reduce((acc, key) => {
        const fieldType = response.data.form_structure[key];
        acc[key] = fieldType.type === 'array' ? [{}] : '';
        return acc;
      }, {}));
      fetchSavedResponses(formId);
    } catch (error) {
      console.error('Failed to fetch form:', error);
      if (error.response && error.response.status === 403) {
        navigate('/');
      }
    }
  };

  const fetchSavedResponses = async (formId) => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get(`http://localhost:8000/api/responses/?form=${formId}`, { headers });
      setSavedResponses(response.data);
    } catch (error) {
      console.error('Failed to fetch saved responses:', error);
      if (error.response && error.response.status === 403) {
        navigate('/');
      }
    }
  };

  const handleChange = (field, value, index = null, subField = null) => {
    if (index !== null) {
      const updatedArray = [...response[field]];
      if (subField) {
        updatedArray[index] = {
          ...updatedArray[index],
          [subField]: value,
        };
      } else {
        updatedArray[index] = value;
      }
      setResponse({
        ...response,
        [field]: updatedArray,
      });
    } else {
      setResponse({
        ...response,
        [field]: value,
      });
    }
  };

  const addArrayItem = (field) => {
    setResponse({
      ...response,
      [field]: [...response[field], {}],
    });
  };

  const handleSave = async () => {
    try {
      const headers = authService.getAuthHeader();
      await axios.post(`http://localhost:8000/api/forms/${selectedFormId}/submit/`, { response_data: response }, { headers });
      alert('Form saved successfully');
      fetchSavedResponses(selectedFormId);
    } catch (error) {
      console.error('Failed to save form:', error);
      if (error.response && error.response.status === 403) {
        navigate('/');
      } else {
        alert('Failed to save form');
      }
    }
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${form.title}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!forms.length) {
    return <div>Loading forms...</div>;
  }

  const renderFields = (structure, parentKey = '') => {
    return Object.keys(structure).map((key) => {
      const fieldType = structure[key];
      const compositeKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof fieldType === 'string') {
        return (
          <div key={compositeKey}>
            <label>{key}:</label>
            <input
              type={fieldType}
              value={response[compositeKey] || ''}
              onChange={(e) => handleChange(compositeKey, e.target.value)}
              required
            />
          </div>
        );
      } else if (fieldType.type === 'array') {
        return (
          <div key={compositeKey}>
            <label>{key}:</label>
            {response[compositeKey] && response[compositeKey].map((item, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                {typeof fieldType.items === 'object'
                  ? renderFields(fieldType.items, `${compositeKey}.${index}`)
                  : <input
                      type={fieldType.items}
                      value={item || ''}
                      onChange={(e) => handleChange(compositeKey, e.target.value, index)}
                      required
                    />}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(compositeKey)}>+ Add</button>
          </div>
        );
      } else {
        return (
          <div key={compositeKey}>
            <label>{key}:</label>
            <div style={{ marginLeft: '20px' }}>{renderFields(fieldType, compositeKey)}</div>
          </div>
        );
      }
    });
  };

  return (
    <div>
      <h2>Fill Form</h2>
      <div>
        <label>Select Form:</label>
        <select value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)}>
          <option value="" disabled>Select a form</option>
          {forms.map((form) => (
            <option key={form.id} value={form.id}>{form.title}</option>
          ))}
        </select>
      </div>
      {form && (
        <div>
          <form>
            {renderFields(form.form_structure)}
            <button type="button" onClick={handleSave}>Save Form</button>
            <button type="button" onClick={handleDownload}>Download JSON</button>
          </form>
          {savedResponses.length > 0 && (
            <div>
              <h3>Saved Responses</h3>
              <ul>
                {savedResponses.map((savedResponse, index) => (
                  <li key={index}>{JSON.stringify(savedResponse.response_data)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FillForm;
