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
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import authService from "../services/authService";

const FillForm = () => {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [form, setForm] = useState(null);
  const [response, setResponse] = useState({});
  const [savedResponses, setSavedResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newField, setNewField] = useState({ name: "", type: "text" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      fetchForm(selectedFormId);
    }
  }, [selectedFormId]);

  useEffect(() => {
    filterResponses(searchTerm);
  }, [savedResponses, searchTerm]);

  const fetchForms = async () => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get("http://localhost:8000/api/forms/", {
        headers,
      });
      setForms(response.data);
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
      const response = await axios.get(
        `http://localhost:8000/api/forms/${formId}/`,
        { headers }
      );
      setForm(response.data);
      setResponse(
        Object.keys(response.data.form_structure).reduce((acc, key) => {
          const fieldType = response.data.form_structure[key];
          acc[key] = fieldType.type === "array" ? [{}] : "";
          return acc;
        }, {})
      );
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
      const response = await axios.get(
        `http://localhost:8000/api/responses/?form=${formId}`,
        { headers }
      );
      setSavedResponses(response.data);
    } catch (error) {
      console.error("Failed to fetch saved responses:", error);
      if (error.response && error.response.status === 403) {
        navigate("/");
      }
    }
  };

  const fetchUserData = async () => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get("http://localhost:8000/api/user/", {
        headers,
      });
      setIsAdmin(response.data.is_admin); // Determines if user is an admin
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      if (error.response && error.response.status === 403) {
        navigate("/");
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
    if (!isAdmin) {
      setResponse({
        ...response,
        [field]: [...response[field], {}],
      });
    }
  };

  const addField = () => {
    if (!isAdmin && newField.name && form) {
      const updatedStructure = {
        ...form.form_structure,
        [newField.name]: { type: newField.type },
      };
      setForm({
        ...form,
        form_structure: updatedStructure,
      });
      setResponse({
        ...response,
        [newField.name]: newField.type === "array" ? [{}] : "",
      });
      setNewField({ name: "", type: "text" });
    }
  };

  const handleSave = async () => {
    try {
      const headers = authService.getAuthHeader();
      await axios.post(
        `http://localhost:8000/api/forms/${selectedFormId}/submit/`,
        { response_data: response },
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
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(response));
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
      const headers = authService.getAuthHeader(); // Get the auth header
      await axios.delete(`http://localhost:8000/api/responses/${responseId}/`, { headers });
      setSavedResponses(savedResponses.filter(response => response.id !== responseId));
      filterResponses(searchTerm);
    } catch (error) {
      console.error("Failed to delete response:", error);
    }
  };

  const renderFields = (structure, parentKey = "") => {
    return Object.keys(structure).map((key) => {
      const fieldType = structure[key];
      const compositeKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof fieldType === "string") {
        return (
          <Grid item xs={12} key={compositeKey}>
            <TextField
              fullWidth
              label={key}
              type={fieldType}
              value={response[compositeKey] || ""}
              onChange={(e) => handleChange(compositeKey, e.target.value)}
              required
            />
          </Grid>
        );
      } else if (fieldType.type === "array") {
        return (
          <Grid item xs={12} key={compositeKey}>
            <Typography variant="subtitle1">{key}:</Typography>
            {response[compositeKey] &&
              response[compositeKey].map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  {typeof fieldType.items === "object" ? (
                    renderFields(fieldType.items, `${compositeKey}.${index}`)
                  ) : (
                    <TextField
                      fullWidth
                      type={fieldType.items}
                      value={item || ""}
                      onChange={(e) =>
                        handleChange(compositeKey, e.target.value, index)
                      }
                      required
                    />
                  )}
                </Box>
              ))}
            {!isAdmin && (
              <Button
                variant="outlined"
                onClick={() => addArrayItem(compositeKey)}
              >
                + Add
              </Button>
            )}
          </Grid>
        );
      } else {
        return (
          <Grid item xs={12} key={compositeKey}>
            <TextField
              fullWidth
              label={key}
              type={fieldType.type}
              value={response[compositeKey] || ""}
              onChange={(e) => handleChange(compositeKey, e.target.value)}
              required
            />
          </Grid>
        );
      }
    });
  };

  return (
    <Box p={2}>
      <Typography variant="h4">Fill Form</Typography>
      
      <Box mt={2}>
      <MenuItem value="">
      Select a form
    </MenuItem>
        <Select
          fullWidth
          value={selectedFormId}
          onChange={(e) => setSelectedFormId(e.target.value)}
        >
 
          {forms.map((form) => (
            
            <MenuItem key={form.id} value={form.id}>
              {form.title}
            </MenuItem>
            
          ))}
        </Select>
      </Box>
      {form && (
        <Box mt={2}>
          <Typography variant="h6">{form.title}</Typography>
          <Typography variant="body1">{form.description}</Typography>
          <Box mt={2}>
            <Grid container spacing={2}>
              {renderFields(form.form_structure)}
            </Grid>
          </Box>
          {!isAdmin && (
            <Box mt={2}>
              <TextField
                label="New Field Name"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                fullWidth
              />
             <br/>
             <br/>
             
              <Select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                fullWidth
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="array">Array</MenuItem>
              </Select>
              <br/>
             <br/>
              <Button variant="outlined" onClick={addField}>
                Add Field
              </Button>
              
            </Box>
          )}
          <Box mt={2}>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" onClick={handleDownload} sx={{ ml: 2 }}>
              Download
            </Button>
          </Box>
        </Box>
      )}
      <Box mt={2}>
        <TextField
          fullWidth
          placeholder="Search responses..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Response ID</TableCell>
                <TableCell>Response Data</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResponses.map((resp) => (
                <TableRow key={resp.id}>
                  <TableCell>{resp.id || "Unnamed"}</TableCell> {/* Assuming name field exists */}
                  <TableCell>{JSON.stringify(resp.response_data)}</TableCell>
                  <TableCell>
                    {!isAdmin && (
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(resp.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default FillForm;
