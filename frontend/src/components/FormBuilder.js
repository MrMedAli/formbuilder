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
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import authService from "../services/authService";

const API_URL = "http://localhost:8000/api/forms/";

const fieldTypes = ["string", "number", "array", "object"];

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

  const addField = () => {
    setFormFields([
      ...formFields,
      { name: "", type: "string", fields: [], itemType: "string" },
    ]);
  };

  const removeField = (index) => {
    const newFormFields = formFields.filter((_, i) => i !== index);
    setFormFields(newFormFields);
  };

  const handleFieldChange = (index, field) => {
    const newFormFields = [...formFields];
    newFormFields[index] = field;
    setFormFields(newFormFields);
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
      <Grid container key={index} alignItems="center" spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={1} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {index === 0 && (
            <Tooltip title="This is an identifier of this form">
              <CheckCircleIcon color="success" />
            </Tooltip>
          )}
        </Grid>
        <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <TextField
            fullWidth
            label="Field name"
            value={field.name}
            onChange={(e) =>
              handleFieldChange(
                index,
                { ...field, name: e.target.value }
              )
            }
            required
            sx={{ mr: 2 }}
          />
          <Select
            value={field.type}
            onChange={(e) =>
              handleFieldChange(
                index,
                {
                  ...field,
                  type: e.target.value,
                  fields: [],
                  itemType: "string",
                }
              )
            }
            sx={{ minWidth: 120, width: 150 }}
          >
            {fieldTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        {field.type === "array" && (
          <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Select
              fullWidth
              value={field.itemType}
              onChange={(e) =>
                handleFieldChange(
                  index,
                  { ...field, itemType: e.target.value, fields: [] }
                )
              }
              sx={{ minWidth: 120, width: 150, ml: 2 }}
            >
              {fieldTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        )}
        <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "center" }}>
          <Button
            onClick={() => removeField(index)}
            startIcon={<DeleteIcon />}
            variant="outlined"
            color="error"
            sx={{ ml: 2 }}
          >
            Remove
          </Button>
        </Grid>
        {field.type === "object" && (
          <Grid item xs={12}>
            <Box sx={{ pl: 2, mt: 2 }}>
              <Button
                onClick={() =>
                  addField(
                    (newFields) =>
                      handleFieldChange(
                        index,
                        { ...field, fields: newFields }
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
                  { ...field, fields: newFields }
                )
              )}
            </Box>
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
            onClick={addField}
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
                          value.type !== "array"
                        ) {
                          return {
                            name: key,
                            type: "object",
                            fields: Object.keys(value).map((nestedKey) => ({
                              name: nestedKey,
                              type: value[nestedKey],
                              fields: [],
                            })),
                          };
                        } else if (
                          typeof value === "object" &&
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
                                ? Object.keys(value.items).map(
                                    (nestedKey) => ({
                                      name: nestedKey,
                                      type: value.items[nestedKey],
                                      fields: [],
                                    })
                                  )
                                : [],
                          };
                        } else {
                          return { name: key, type: value, fields: [] };
                        }
                      })
                    );
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  sx={{ ml: 2 }}
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
