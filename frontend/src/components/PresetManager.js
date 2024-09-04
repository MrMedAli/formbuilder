import React, { useState, useEffect } from "react";
import apiUrl from '../config';
import axios from "axios";
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
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ViewIcon from "@mui/icons-material/Visibility";
import authService from "../services/authService";
import { parseJwt } from "../utils/jwtUtils";
import FillForm from "./FillForm";

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

  const fetchResponses = async () => {
    try {
      const headers = authService.getAuthHeader();
      const response = await axios.get(`${apiUrl}/api/responses/`, { headers });
      setResponses(response.data);
    } catch (error) {
      console.error("Failed to fetch responses:", error);
    }
  };

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
    if (selectedTitle) {
      filtered = filtered.filter(response => formTitles[response.form] === selectedTitle);
    }
    if (term) {
      filtered = filtered.filter(response => {
        const valueMatch = JSON.stringify(response.response_data).toLowerCase().includes(term.toLowerCase());
        return valueMatch;
      });
    }
    setFilteredResponses(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFormTitleChange = (event) => {
    setSelectedFormTitle(event.target.value);
  };

  const handleDelete = async (responseId) => {
    try {
      const headers = authService.getAuthHeader();
      await axios.delete(`${apiUrl}/api/responses/${responseId}/`, { headers });
      setResponses(responses.filter(response => response.id !== responseId));
      filterResponses(searchTerm, selectedFormTitle);
    } catch (error) {
      console.error("Failed to delete response:", error);
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
      await axios.put(`${apiUrl}/api/responses/${editResponse.id}/`, responseData, { headers });
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
          placeholder="Search by form title or value..."
          value={searchTerm}
          onChange={handleSearchChange}
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
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="form-title-label">Filter by Form Title</InputLabel>
          <Select
            labelId="form-title-label"
            id="form-title-select"
            value={selectedFormTitle}
            label="Filter by Form Title"
            onChange={handleFormTitleChange}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {Object.values(formTitles).map((title, index) => (
              <MenuItem key={index} value={title}>
                {title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2} mt={2}>
        {filteredResponses.map(response => (
          <Grid item xs={12} md={6} lg={4} key={response.id}>
            <Card sx={cardStyle} onClick={() => handleViewToggle(response)}>
              <CardContent sx={contentStyle}>
                <Typography variant="h6" gutterBottom>
                  {formTitles[response.form]}
                </Typography>
                {renderResponseData(response.response_data)}
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 8, p: 2 }}>
                <IconButton aria-label="edit" color="primary" onClick={() => handleEdit(response)}>
                      <EditIcon />
                </IconButton>
                <IconButton aria-label="delete" color="error" onClick={() => handleDelete(response.id)}>
                      <DeleteIcon />
                </IconButton>
                <IconButton aria-label="download" onClick={() => handleDownload(response)}>
                  <DownloadIcon />
                </IconButton>
                <IconButton aria-label="view" sx={{color:"black"}} onClick={() => handleViewToggle(response)}>
                  <ViewIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!editResponse} onClose={handleEditCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          {displayMode ? "View Response" : "Edit Response"}
        </DialogTitle>
        <DialogContent dividers>
          {renderResponseData(editData, !displayMode)}
        </DialogContent>
        <DialogActions>
          {displayMode ? (
            <Button onClick={handleCloseView}>Close</Button>
          ) : (
            <>
              <Button onClick={handleEditCancel}>Cancel</Button>
              <Button onClick={handleEditSave} color="primary" variant="contained">Save</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={isFillFormOpen} onClose={handleCloseFillForm} maxWidth="md" fullWidth>
        <DialogTitle>Create New Preset</DialogTitle>
        <DialogContent>
          <FillForm onClose={handleCloseFillForm} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PresetManager;
