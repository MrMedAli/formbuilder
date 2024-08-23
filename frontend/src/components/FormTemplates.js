import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Grid,
  Modal,
  CircularProgress,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import authService from "../services/authService";
import { parseJwt } from "../utils/jwtUtils";

const API_URL = "http://localhost:8000/api/forms/";
const fieldTypes = ["string", "number", "object", "array"];

const FormTemplates = () => {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [title, setTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewOnlyMode, setViewOnlyMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchForms();
    const currentUser = authService.getCurrentUser();
    const token = currentUser?.access;

    if (token) {
      const decoded = parseJwt(token);
      setIsAdmin(decoded?.is_admin ?? false);
      setCurrentUserId(decoded?.user_id ?? null);
    }
  }, []);

  useEffect(() => {
    const filtered = forms.filter((form) =>
      form.title.toLowerCase().includes(filterText.toLowerCase())
    );
    setFilteredForms(filtered);
  }, [filterText, forms]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: authService.getAuthHeader(),
      });
      setForms(response.data);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
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
      if (selectedForm) {
        // Update existing form
        await axios.put(`${API_URL}${selectedForm.id}/`, formData, {
          headers: authService.getAuthHeader(),
        });
      } else {
        // Create new form
        await axios.post(API_URL, formData, {
          headers: authService.getAuthHeader(),
        });
      }
      fetchForms();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formId) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}${formId}/`, {
        headers: authService.getAuthHeader(),
      });
      fetchForms();
    } catch (error) {
      console.error("Failed to delete form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (form) => {
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
    setIsModalOpen(true);
    setViewOnlyMode(false);
  };

  const handleViewClick = (form) => {
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
    setIsModalOpen(true);
    setViewOnlyMode(true);
  };

  const handleOpenModal = () => {
    setSelectedForm(null);
    setTitle("");
    setFormFields([]);
    setIsModalOpen(true);
    setViewOnlyMode(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

  const renderFields = (fields, setFields, readOnly) => {
    return fields.map((field, index) => (
      <Grid container spacing={2} key={index} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
          sx={{mt:0.6}}
            fullWidth
            label="Field name"
            value={field.name}
            onChange={(e) =>
              !readOnly &&
              handleFieldChange(
                index,
                { ...field, name: e.target.value },
                fields,
                setFields
              )
            }
            required
            InputProps={{
              readOnly,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Select
            fullWidth
            value={field.type}
            onChange={(e) =>
              !readOnly &&
              handleFieldChange(
                index,
                { ...field, type: e.target.value },
                fields,
                setFields
              )
            }
            displayEmpty
            inputProps={{ "aria-label": "Field type" }}
            required
            disabled={readOnly}
          >
            {fieldTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={4}>
          {!readOnly && (
            <IconButton
              color="error"
              onClick={() =>
                removeField(index, fields, setFields)
              }
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
    ));
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Form Templates
        </Typography>
        <TextField
          label="Filter"
          variant="outlined"
          fullWidth
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
          sx={{ mb: 2 }}
        >
          Create New Form
        </Button>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2}>
            {filteredForms.map((form) => (
           <Grid item xs={12} sm={6} md={4} key={form.id}>
           <Card
             sx={{
               '&:hover': {
                 transform: 'scale(1.05)',
                 transition: 'transform 0.2s ease-in-out',
               },
             }}
             onClick={() => handleViewClick(form)}  // Trigger view mode on card click
           >
             <CardContent>
               <Typography variant="h6" gutterBottom>
                 {form.title}
               </Typography>
               <Grid container spacing={1}>
  {Object.keys(form.form_structure).map((key, index) => {
    const value = form.form_structure[key];
    let displayValue;

    // Determine the display value based on the field type
    if (typeof value === 'string') {
      displayValue = value; // Handle cases like "String" or "Number"
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        displayValue = "Array"; // Handle array type
      } else {
        displayValue = "Object"; // Handle object type
      }
    } else {
      displayValue = "Unknown"; // Fallback case
    }

    return (
      <Grid item xs={12} sm={6} key={index}>
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>{key}:</strong> {displayValue}
          </Typography>
        </Box>
      </Grid>
    );
  })}
</Grid>

             </CardContent>
             <CardActions>
               {isAdmin && (
                 <>
                   <IconButton
                     color="primary"
                     onClick={(e) => {
                       e.stopPropagation(); // Prevent the card click from triggering view mode
                       handleEditClick(form);
                     }}
                   >
                     <EditIcon />
                   </IconButton>
                   <IconButton
                     color="error"
                     onClick={(e) => {
                       e.stopPropagation(); // Prevent the card click from triggering view mode
                       handleDelete(form.id);
                     }}
                   >
                     <DeleteIcon />
                   </IconButton>
                 </>
               )}
               <IconButton
                 color="default"
                 onClick={(e) => {
                   e.stopPropagation(); // Prevent the card click from triggering view mode
                   handleViewClick(form);
                 }}
               >
                 <VisibilityIcon />
               </IconButton>
             </CardActions>
           </Card>
         </Grid>
         
          
            
            ))}
          </Grid>
        )}
      </Box>

      {/* Form Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="form-modal-title"
        aria-describedby="form-modal-description"
      >
        <Box
          sx={{
            width: "80%",
            maxWidth: 600,
            bgcolor: "background.paper",
            p: 4,
            margin: "auto",
            mt: "10%",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" id="form-modal-title">
            {selectedForm ? "Edit Form" : "Create New Form"}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              margin="normal"
              InputProps={{
                readOnly: viewOnlyMode,
              }}
            />
            {renderFields(formFields, setFormFields, viewOnlyMode)}
            {!viewOnlyMode && (
              <Button
              sx={{ mt: 2 }}
                variant="contained"
                color="primary"
                onClick={() => addField(formFields, setFormFields)}
              >
                <AddIcon /> Add Field
              </Button>
            )}
            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mr: 2 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default FormTemplates;
