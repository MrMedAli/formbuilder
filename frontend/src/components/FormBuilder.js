import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import authService from "../services/authService";

const API_URL = "http://localhost:8000/api/forms/";

const fieldTypes = ["string", "number", "object", "array"];

const FormBuilder = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [title, setTitle] = useState("");
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
        navigate("/");
      } else {
        console.error("Failed to fetch forms:", error);
      }
    }
  };

  const addField = (fields, setFields) => {
    setFields([
      ...fields,
      { name: "", type: "string", fields: [], itemType: "string" },
    ]);
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
        if (field.type === "object") {
          acc[field.name] = buildNestedFields(field.fields);
        } else if (field.type === "array") {
          acc[field.name] = {
            type: "array",
            items:
              field.itemType === "object"
                ? buildNestedFields(field.fields)
                : field.itemType,
          };
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
      setTitle("");
      setFormFields([]);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate("/");
      } else {
        console.error("Failed to save form:", error);
      }
    }
  };

  const handleDelete = async (formId) => {
    try {
      const headers = authService.getAuthHeader();
      await axios.delete(`${API_URL}${formId}/`, { headers });
      fetchForms();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/");
      } else {
        console.error("Failed to delete form:", error);
      }
    }
  };

  const buildNestedFields = (fields) => {
    return fields.reduce((acc, field) => {
      if (field.type === "object") {
        acc[field.name] = buildNestedFields(field.fields);
      } else if (field.type === "array") {
        acc[field.name] = {
          type: "array",
          items:
            field.itemType === "object"
              ? buildNestedFields(field.fields)
              : field.itemType,
        };
      } else {
        acc[field.name] = field.type;
      }
      return acc;
    }, {});
  };

  const renderFields = (fields, setFields) => {
    return fields.map((field, index) => (
      <Grid container spacing={2} key={index} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Field name"
            value={field.name}
            onChange={(e) =>
              handleFieldChange(
                index,
                { ...field, name: e.target.value },
                fields,
                setFields
              )
            }
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Select
            fullWidth
            value={field.type}
            onChange={(e) =>
              handleFieldChange(
                index,
                {
                  ...field,
                  type: e.target.value,
                  fields: [],
                  itemType: "string",
                },
                fields,
                setFields
              )
            }
          >
            {fieldTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            onClick={() => removeField(index, fields, setFields)}
            startIcon={<DeleteIcon />}
            variant="outlined"
            color="error"
          >
            Remove
          </Button>
        </Grid>
        {field.type === "object" && (
          <Grid item xs={12}>
            <Box sx={{ pl: 2 }}>
              <Button
                onClick={() =>
                  addField(field.fields, (newFields) =>
                    handleFieldChange(
                      index,
                      { ...field, fields: newFields },
                      fields,
                      setFields
                    )
                  )
                }
                variant="outlined"
              >
                Add Nested Field
              </Button>
              {renderFields(field.fields, (newFields) =>
                handleFieldChange(
                  index,
                  { ...field, fields: newFields },
                  fields,
                  setFields
                )
              )}
            </Box>
          </Grid>
        )}
        {field.type === "array" && (
          <Grid item xs={12}>
            <Select
              fullWidth
              value={field.itemType}
              onChange={(e) =>
                handleFieldChange(
                  index,
                  { ...field, itemType: e.target.value, fields: [] },
                  fields,
                  setFields
                )
              }
            >
              {fieldTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {field.itemType === "object" && (
              <Box sx={{ pl: 2 }}>
                <Button
                  onClick={() =>
                    addField(field.fields, (newFields) =>
                      handleFieldChange(
                        index,
                        { ...field, fields: newFields },
                        fields,
                        setFields
                      )
                    )
                  }
                  variant="outlined"
                >
                  Add Nested Field
                </Button>
                {renderFields(field.fields, (newFields) =>
                  handleFieldChange(
                    index,
                    { ...field, fields: newFields },
                    fields,
                    setFields
                  )
                )}
              </Box>
            )}
          </Grid>
        )}
      </Grid>
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Form Builder
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Fields:
          </Typography>
          {renderFields(formFields, setFormFields)}
          <Button
            variant="contained"
            onClick={() => addField(formFields, setFormFields)}
            sx={{ mt: 2 }}
          >
            Add Field
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2, ml: 2 }}
          >
            Save Form
          </Button>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Existing Forms
      </Typography>
      <List>
        {forms.map((form) => (
          <ListItem
            key={form.id}
            secondaryAction={
              <Box>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => {
                    setSelectedForm(form);
                    setTitle(form.title);
                    setFormFields(
                      Object.keys(form.form_structure).map((key) => {
                        const value = form.form_structure[key];
                        if (
                          typeof value === "object" &&
                          !Array.isArray(value) &&
                          value.type === "array"
                        ) {
                          return {
                            name: key,
                            type: "array",
                            itemType:
                              typeof value.items === "object"
                                ? "object"
                                : value.items,
                            fields:
                              typeof value.items === "object"
                                ? Object.keys(value.items).map((nestedKey) => ({
                                    name: nestedKey,
                                    type: value.items[nestedKey],
                                    fields: [],
                                  }))
                                : [],
                          };
                        }
                        return {
                          name: key,
                          type:
                            typeof value === "object" && !Array.isArray(value)
                              ? "object"
                              : value,
                          fields:
                            typeof value === "object" && !Array.isArray(value)
                              ? Object.keys(value).map((nestedKey) => ({
                                  name: nestedKey,
                                  type: value[nestedKey],
                                  fields: [],
                                }))
                              : [],
                        };
                      })
                    );
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(form.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText primary={form.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FormBuilder;
