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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import authService from "../services/authService";
import { parseJwt } from "../utils/jwtUtils";

const FillForm = () => {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [form, setForm] = useState(null);
  const [response, setResponse] = useState({});
  const [savedResponses, setSavedResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newField, setNewField] = useState({ name: "", type: "string", itemType: "string" });
  const [formTitles, setFormTitles] = useState({});
  const [showAddField, setShowAddField] = useState(false);
  const [addedFields, setAddedFields] = useState([]);
  const [disabledFields, setDisabledFields] = useState({});
  const [identifiers, setIdentifiers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
    const currentUser = authService.getCurrentUser();
    const token = currentUser?.access;

    if (token) {
      const decoded = parseJwt(token);
      setIsAdmin(decoded?.is_admin ?? false);
    }
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      fetchForm(selectedFormId);
    }
  }, [selectedFormId]);

  useEffect(() => {
    if (form) {
      setResponse(
        Object.keys(form.form_structure).reduce((acc, key) => {
          const fieldType = form.form_structure[key];
          acc[key] = fieldType.type === "array" ? (fieldType.items ? [{}] : []) : null;
          return acc;
        }, {})
      );
    }
  }, [form]);

  useEffect(() => {
    if (savedResponses.length) {
      filterResponses(searchTerm);
    }
  }, [savedResponses, searchTerm]);

  const fetchForms = async () => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get("http://localhost:8000/api/forms/", { headers });
      setForms(response.data);

      const formTitleMap = response.data.reduce((map, form) => {
        map[form.id] = form.title;
        return map;
      }, {});
      setFormTitles(formTitleMap);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
      if (error.response && error.response.status === 403) {
        navigate("/");
      }
    }
  };

  const fetchForm = async (formId) => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get(`http://localhost:8000/api/forms/${formId}/`, { headers });
      setForm(response.data);
      fetchSavedResponses(formId);
    } catch (error) {
      console.error("Failed to fetch form:", error);
      if (error.response && error.response.status === 403) {
        navigate("/");
      }
    }
  };

  const fetchSavedResponses = async (formId) => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get(`http://localhost:8000/api/responses/?form=${formId}`, { headers });
      setSavedResponses(response.data);
    } catch (error) {
      console.error("Failed to fetch saved responses:", error);
      if (error.response && error.response.status === 403) {
        navigate("/");
      }
    }
  };

  const handleChange = (field, value, index = null, subField = null) => {
    const updateNestedObject = (obj, path, value) => {
      const keys = path.split(".");
      const lastKey = keys.pop();
      const nestedObj = keys.reduce((acc, key) => acc[key] = acc[key] || {}, obj);
      nestedObj[lastKey] = value;
      return { ...response, ...obj };
    };
  
    if (index !== null) {
      const updatedArray = [...response[field]];
      if (subField) {
        updatedArray[index] = { ...updatedArray[index], [subField]: value };
      } else {
        updatedArray[index] = value;
      }
      setResponse({ ...response, [field]: updatedArray });
    } else {
      setResponse(updateNestedObject(response, field, value));
    }
  };

  const addArrayItem = (field) => {
    if (!isAdmin) {
      const fieldType = form.form_structure[field];
      if (fieldType.items) {
        setResponse({
          ...response,
          [field]: [...response[field], fieldType.items.type === "object" ? {} : ""],
        });
      } else {
        setResponse({ ...response, [field]: [...response[field], ""] });
      }
    }
  };

  const addField = () => {
    if (!isAdmin && newField.name && form) {
      const updatedStructure = {
        ...form.form_structure,
        [newField.name]: {
          type: newField.type,
          items: newField.type === "array" ? { type: newField.itemType } : undefined,
        },
      };
      setForm({
        ...form,
        form_structure: updatedStructure,
      });
      setResponse({
        ...response,
        [newField.name]: newField.type === "array" ? (newField.itemType === "object" ? [{}] : []) : "",
      });
      setAddedFields([...addedFields, { name: newField.name, type: newField.type, itemType: newField.itemType, disabled: false }]);
      setNewField({ name: "", type: "string", itemType: "string" });
      setShowAddField(false);
    }
  };

  const removeField = (index) => {
    const fieldToRemove = addedFields[index];
    const updatedFields = addedFields.filter((_, i) => i !== index);
    const updatedStructure = { ...form.form_structure };
    delete updatedStructure[fieldToRemove.name];
    setForm({ ...form, form_structure: updatedStructure });
    const updatedResponse = { ...response };
    delete updatedResponse[fieldToRemove.name];
    setResponse(updatedResponse);
    setAddedFields(updatedFields);
  };

  const disableField = (field) => {
    setDisabledFields((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSave = async () => {
    try {
      const headers = authService.getAuthHeader();
      const currentUser = authService.getCurrentUser();
      const userId = currentUser ? parseJwt(currentUser.access).user_id : null;
  
      // Filter out disabled fields before saving the response
      const filteredResponse = Object.keys(response).reduce((acc, key) => {
        if (!disabledFields[key]) {
          acc[key] = response[key];
        }
        return acc;
      }, {});
  
      await axios.post(
        `http://localhost:8000/api/forms/${selectedFormId}/submit/`,
        { response_data: filteredResponse, user: userId },
        { headers }
      );
  
      alert("Form saved successfully");
      fetchSavedResponses(selectedFormId);
    } catch (error) {
      console.error("Failed to save form:", error);
      if (error.response && error.response.status === 403) {
        navigate("/");
      } else {
        alert("Failed to save form");
      }
    }
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${form.title}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filterResponses = (term) => {
    if (term) {
      const filtered = savedResponses.filter((response) =>
        Object.values(response.response_data).some((value) =>
          JSON.stringify(value).toLowerCase().includes(term.toLowerCase())
        )
      );
      setFilteredResponses(filtered);
    } else {
      setFilteredResponses(savedResponses);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterResponses(term);
  };

  const handleDelete = async (responseId) => {
    try {
      const headers = authService.getAuthHeader();
      await axios.delete(`http://localhost:8000/api/responses/${responseId}/`, { headers });
      
      const updatedSavedResponses = savedResponses.filter(response => response.id !== responseId);
      setSavedResponses(updatedSavedResponses);
  
      if (searchTerm) {
        filterResponses(searchTerm);
      } else {
        setFilteredResponses(updatedSavedResponses);
      }
      
      alert("Response deleted successfully");
    } catch (error) {
      console.error("Failed to delete response:", error);
      alert("Failed to delete response");
    }
  };

  const renderFields = () => {
    return Object.keys(form.form_structure).map((field, index) => {
      const fieldType = form.form_structure[field];
      const disabled = disabledFields[field];
      const identifier = identifiers[field] || null;
      const fieldComment = form.form_structure[field]?.comment || ""; // Fetch comment from form structure
  
      return (
        <Grid container alignItems="center" key={field} spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={8}>
            {fieldType.type === "array" ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {field}
                </Typography>
                {response[field].map((item, idx) => (
                  <Grid container alignItems="center" key={`${field}-${idx}`} spacing={1}>
                    <Grid item xs={10}>
                      {fieldType.items.type === "object" ? (
                        Object.keys(fieldType.items.properties).map((subField) => (
                          <TextField
                            key={`${field}-${idx}-${subField}`}
                            label={`${field} ${idx + 1} ${subField}`}
                            value={item[subField] || ""}
                            onChange={(e) => handleChange(field, e.target.value, idx, subField)}
                            fullWidth
                            disabled={disabled}
                            InputProps={{
                              startAdornment: identifier === field && (
                                <InputAdornment position="start">
                                  <Typography variant="caption" sx={{ color: "green" }}>
                                    Primary Key
                                  </Typography>
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography variant="caption" sx={{ color: "grey" }}>
                                    {fieldComment} {/* Display comment */}
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                          />
                        ))
                      ) : (
                        <TextField
                          label={`${field} ${idx + 1}`}
                          value={item || ""}
                          onChange={(e) => handleChange(field, e.target.value, idx)}
                          fullWidth
                          disabled={disabled}
                          InputProps={{
                            startAdornment: identifier === field && (
                              <InputAdornment position="start">
                                <Typography variant="caption" sx={{ color: "green" }}>
                                  Primary Key
                                </Typography>
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography variant="caption" sx={{ color: "grey" }}>
                                  {fieldComment} {/* Display comment */}
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={2}>
                      <Button variant="contained" color="secondary" onClick={() => addArrayItem(field)}>
                        Add Item
                      </Button>
                    </Grid>
                  </Grid>
                ))}
              </>
            ) : (
              <TextField
                label={field}
                value={response[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                fullWidth
                disabled={disabled}
                InputProps={{
                  startAdornment: identifier === field && (
                    <InputAdornment position="start">
                      <Typography variant="caption" sx={{ color: "green" }}>
                        Primary Key
                      </Typography>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" sx={{ color: "grey" }}>
                        {fieldComment} {/* Display comment */}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Grid>
          <Grid item xs={4}>
            <Button
              onClick={() => disableField(field)}
              startIcon={<VisibilityIcon />}
              variant="outlined"
              color="warning"
              sx={{ mr: 1 }}
            >
              {disabled ? "Enable" : "Disable"}
            </Button>
          </Grid>
        </Grid>
      );
    });
  };
  
  
  
  
  
  
  
  

  const renderResponseData = () => {
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Form Title</TableCell>
              <TableCell>Response Data</TableCell>
              {isAdmin && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResponses.map((savedResponse) => (
              <TableRow key={savedResponse.id}>
                <TableCell>{formTitles[savedResponse.form]}</TableCell>
                <TableCell>
                  <pre>{JSON.stringify(savedResponse.response_data, null, 2)}</pre>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(savedResponse.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fill Form
      </Typography>
      <Select
        value={selectedFormId}
        onChange={(e) => setSelectedFormId(e.target.value)}
        displayEmpty
        fullWidth
      >
        <MenuItem value="" disabled>
          Select a Form
        </MenuItem>
        {forms.map((form) => (
          <MenuItem key={form.id} value={form.id}>
            {form.title}
          </MenuItem>
        ))}
      </Select>
      {form && (
        <Box sx={{ marginTop: 3 }}>
          {renderFields(form.form_structure)}
          <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save Response
            </Button>
            <Button onClick={handleDownload} variant="outlined" color="primary">
              Download JSON
            </Button>
          </Box>
          <Box sx={{ marginTop: 3 }}>
            <TextField
              label="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {renderResponseData()}
          </Box>
        </Box>
      )}
    
    </Box>
  );
};

export default FillForm;
