import React, { useState, useEffect } from "react";
import axios from "axios";
import apiUrl from '../config';
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  IconButton,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewIcon from "@mui/icons-material/Visibility";

import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import authService from "../services/authService";
import { parseJwt } from "../utils/jwtUtils";
import FillForms from "./FillForms";

const cardStyle = {
  width: '100%',
  height: '250px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  cursor: 'pointer',
};

const contentStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 5,
};

const PresetManager = () => {
  
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [editResponse, setEditResponse] = useState(null);
  const [formulaires, setFormulaires] = useState([]);
  const [editData, setEditData] = useState({});
  const [displayMode, setDisplayMode] = useState(false);
  const [isFillFormOpen, setIsFillFormOpen] = useState(false);
  const [formTitles, setFormTitles] = useState({});
  const [selectedFormTitle, setSelectedFormTitle] = useState("");

  useEffect(() => {
    fetchResponses();
    fetchFormTitles();
    const user = authService.getCurrentUser();
    if (user) {
      const decoded = parseJwt(user.access);
      setCurrentUser(decoded?.user_id ?? null);
    }
  }, []);

  useEffect(() => {
    filterResponses(searchTerm, selectedFormTitle);
  }, [responses, searchTerm, selectedFormTitle, formTitles]);

  useEffect(() => {
    const fetchFormulaires = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/formulaires/`);
        console.log("Fetched Formulaires:", response.data);
        setFormulaires(response.data);
      } catch (error) {
        console.error("Error fetching formulaires:", error);
      }
    };
  
    fetchFormulaires();
  }, []);
  
  const fetchResponses = async () => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get(`${apiUrl}/api/form-responses/`, { headers });
      setResponses(response.data);
    } catch (error) {
      console.error("Failed to fetch responses:", error);
    }
  };
  const filterFormulaires = (searchTerm, selectedFormTitle) => {
    // Implement filtering logic here
  };

  const handleClick = () => {
    if (formulaires.length > 0) {
      handleDelete(formulaires[0].id); // Adjust this as needed
    }}
  
  const fetchFormTitles = async () => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get(`${apiUrl}/api/forms/`, { headers });
      const formTitleMap = response.data.reduce((map, form) => {
        map[form.id] = form.title;
        return map;
      }, {});
      setFormTitles(formTitleMap);
    } catch (error) {
      console.error("Failed to fetch form titles:", error);
    }
  };

  const filterResponses = (term, selectedTitle) => {
    let filtered = responses;
  
    // Filter by form title if selected
    if (selectedTitle) {
      filtered = filtered.filter(response => formTitles[response.form] === selectedTitle);
    }
  
    // Filter by search term
    if (term) {
      filtered = filtered.filter(response => {
        const valueMatch = JSON.stringify(response.response_data).toLowerCase().includes(term.toLowerCase());
        const idMatch = response.form.toString().includes(term); // Check if the search term matches the form ID
        return valueMatch || idMatch; // Match either the form ID or the response data values
      });
    }
  
    setFilteredResponses(filtered);
  };
  const handleView = (response) => {
    setEditResponse(response);
    setEditData(flattenObject(response.response_data));
    setDisplayMode(true);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  

  const handleFormTitleChange = (event) => {
    setSelectedFormTitle(event.target.value);
  };

  const handleDelete = async (formId) => {
    try {
      const headers = authService.getAuthHeader();
      console.log("Deleting Formulaire with ID:", formId);
  
      // Make the DELETE request
      const response = await axios.delete(`${apiUrl}/api/formulaires/${formId}/`, { headers });
  
      // Check the response status
      if (response.status === 204) {
        console.log("Successfully deleted Formulaire with ID:", formId);
        // Optionally update state or perform any other actions
  
        // Force reload the page
        window.location.reload();
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };
  
  
  

  const handleEdit = (response) => {
    setEditResponse(response);
    setEditData(flattenObject(response.response_data));
    setDisplayMode(false);
  };

  const flattenObject = (obj, parentKey = '', res = {}) => {
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          flattenObject(obj[key], newKey, res);
        } else {
          res[newKey] = obj[key];
        }
      }
    }
    return res;
  };

  const unflattenObject = (flatObj) => {
    const result = {};
    for (const key in flatObj) {
      if (Object.hasOwnProperty.call(flatObj, key)) {
        const keys = key.split('.');
        keys.reduce((acc, part, i) => {
          if (i === keys.length - 1) {
            acc[part] = flatObj[key];
          } else {
            if (!acc[part]) acc[part] = {};
            return acc[part];
          }
        }, result);
      }
    }
    return result;
  };

  const handleEditChange = (key, value) => {
    setEditData(prevData => ({
      ...prevData,
      [key]: value
    }));
  };

  const handleEditSave = async () => {
    try {
      const headers = authService.getAuthHeader();
      const responseData = {
        response_data: unflattenObject(editData)
      };
      await axios.put(`${apiUrl}/api/form-responses/${editResponse.id}/`, responseData, { headers });
      setResponses(responses.map(resp => (resp.id === editResponse.id ? { ...resp, response_data: responseData.response_data } : resp)));
      setEditResponse(null);
    } catch (error) {
      console.error("Failed to update response:", error);
    }
  };

  const handleEditCancel = () => {
    setEditResponse(null);
    setDisplayMode(false);
  };

  const handleViewToggle = (response) => {
    setEditResponse(response);
    setEditData(flattenObject(response.response_data));
    setDisplayMode(true);
  };

  const handleCloseView = () => {
    setEditResponse(null);
    setDisplayMode(false);
  };

  const renderResponseData = (data, isEditing = false) => {
    if (!data) return null;

    const renderObject = (obj, parentKey = '') => {
      if (typeof obj === 'object' && obj !== null) {
        return (
          <Box sx={{ pl: 2 }}>
            {Object.entries(obj).map(([key, value]) => (
              <Box key={key} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{key}:</strong>
                </Typography>
                {typeof value === 'object' ? (
                  renderObject(value, `${parentKey}${key}.`)
                ) : (
                  isEditing ? (
                    <TextField
                      margin="dense"
                      label={key}
                      name={key}
                      type="text"
                      fullWidth
                      value={editData[parentKey + key] || ""}
                      onChange={(e) => handleEditChange(parentKey + key, e.target.value)}
                    />
                  ) : (
                    <Typography variant="body2">
                      <strong>Type:</strong> {typeof value} <br />
                      <strong>Value:</strong> {String(value)}
                    </Typography>
                  )
                )}
              </Box>
            ))}
          </Box>
        );
      }
    };

    return (
      <Box sx={{ p: 2 }}>
        {renderObject(data)}
      </Box>
    );
  };

  const handleDownload = (response) => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(response.response_data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `response_${response.id}.json`);
    downloadAnchor.click();
  };

  const handleOpenFillForm = () => {
    setIsFillFormOpen(true);
  };

  const handleCloseFillForm = () => {
    setIsFillFormOpen(false);
    fetchResponses(); // Refresh responses when closing FillForm
  };

  return (
    <Box p={2}>
      <Typography variant="h4">Preset Manager</Typography>
      <Box mt={2} mb={2}>
        <Button variant="contained" color="primary" onClick={handleOpenFillForm}>
          Add New Preset
        </Button>
      </Box>
      <Box mt={2} display="flex" alignItems="center" gap={2}>
        <TextField
          fullWidth
          placeholder="Search by form ID or value..."
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
        
      </Box>
      <Grid container spacing={2} mt={2}>
        {filteredResponses.map((response) => (
          <Grid item xs={12} sm={6} md={4} key={response.id}>
            <Card sx={cardStyle} onClick={() => handleViewToggle(response)}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Form ID: {response.form}
                </Typography>
                <Typography variant="body2" sx={contentStyle}>
                  {JSON.stringify(response.response_data, null, 2)}
                </Typography>
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={(e) => { e.stopPropagation(); handleDownload(response); }}>
                  <DownloadIcon />
                </IconButton>
                <IconButton
              color="primary"
              onClick={() => handleView(response)}
            >
              <ViewIcon />
            </IconButton>
                
                {currentUser && (
                  <>
                 
                    
      {formulaires.length > 0 && (
        <IconButton
          color="error"
          onClick={handleClick}
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
      )}
      {formulaires.length === 0 ? (
        <p>No Formulaires available.</p>
      ) : (
        formulaires.map(formulaire => (
          <div key={formulaire.id}>
            {/* Render your formulaire content here */}
            <p>{formulaire.name}</p> {/* Example content */}
          </div>
        ))
      )}
   


                  </>
                )}
                
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={editResponse !== null} onClose={handleEditCancel}>
        <DialogTitle>Edit Response</DialogTitle>
        <DialogContent>
          {editResponse && renderResponseData(editResponse.response_data, true)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={displayMode} onClose={handleCloseView}>
        <DialogTitle>View Response</DialogTitle>
        <DialogContent>
          {editResponse && renderResponseData(editResponse.response_data, false)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isFillFormOpen} onClose={handleCloseFillForm} fullWidth maxWidth="md">
        <DialogTitle>Add New Preset</DialogTitle>
        <DialogContent>
          <FillForms onClose={handleCloseFillForm} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PresetManager;
