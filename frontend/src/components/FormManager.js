import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import authService from '../services/authService';

const API_URL = 'http://localhost:8000/api/forms/';

const FormManager = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get(API_URL, { headers: authService.getAuthHeader() });
      setForms(response.data);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedForm) {
        await axios.put(`${API_URL}${selectedForm.id}/`, values, { headers: authService.getAuthHeader() });
      } else {
        await axios.post(API_URL, values, { headers: authService.getAuthHeader() });
      }
      fetchForms();
      setSelectedForm(null);
    } catch (error) {
      console.error('Failed to save form:', error);
    }
  };

  const handleDelete = async (formId) => {
    try {
      await axios.delete(`${API_URL}${formId}/`, { headers: authService.getAuthHeader() });
      fetchForms();
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  };

  const formSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    form_structure: Yup.object().required('Form structure is required'),
  });

  return (
    <div>
      <h2>Form Manager</h2>
      <Formik
        initialValues={selectedForm || { title: '', form_structure: {} }}
        enableReinitialize
        validationSchema={formSchema}
        onSubmit={handleSubmit}
      >
        {({ values }) => (
          <Form>
            <div>
              <label>Title:</label>
              <Field name="title" />
            </div>
            <div>
              <label>Form Structure:</label>
              <Field name="form_structure" as="textarea" />
            </div>
            <button type="submit">Save Form</button>
          </Form>
        )}
      </Formik>

      <h3>Existing Forms</h3>
      <ul>
        {forms.map((form) => (
          <li key={form.id}>
            {form.title}
            <button onClick={() => setSelectedForm(form)}>Edit</button>
            <button onClick={() => handleDelete(form.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormManager;
