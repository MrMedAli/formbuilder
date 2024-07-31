import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Modal,
  TextField,
  Paper,
} from "@mui/material";
import { keyframes } from '@emotion/react';
import { css } from '@emotion/react';

// Define keyframes for the congratulations animation
const congratulationsAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(20px);
  }
`;

// Define the CSS for the congratulations message
const congratulationsStyle = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  pointer-events: none;
`;

const FormTemplates = () => {
  const staticTemplates = [
    {
      id: 1,
      title: "Template One",
      description: { content: "This is the first template" },
    },
    {
      id: 2,
      title: "Template Two",
      description: { content: "This is the second template" },
    },
    {
      id: 3,
      title: "Template Three",
      description: { content: "This is the third template" },
    },
  ];

  const [templates, setTemplates] = useState(staticTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState(staticTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const filtered = templates.filter((template) =>
      template.title.toLowerCase().includes(filterText.toLowerCase())
    );
    setFilteredTemplates(filtered);
  }, [filterText, templates]);

  const handleCardClick = (template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Form Templates
        </Typography>
        <TextField
          label="Filter by Title"
          variant="outlined"
          size="small"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          sx={{ mb: 0 }}
        />
      </Box>
      <Grid container spacing={2}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              onClick={() => handleCardClick(template)}
              sx={{
                mb: 2,
                boxShadow: 3,
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                transition: '0.3s',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'scale(1.02)',
                  bgcolor: 'primary.light',
                  cursor: 'pointer',
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {template.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {JSON.stringify(template.description, null, 2)}
                </Typography>
                <Box
                  sx={{
                    ...congratulationsStyle,
                    '&:hover': {
                      opacity: 1,
                      animation: `${congratulationsAnimation} 2s ease-in-out`,
                    },
                  }}
                >
                  Congratulations!
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            p: 3,
            bgcolor: "background.paper",
            margin: "auto",
            maxWidth: 500,
            mt: 10,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Paper sx={{ p: 2 }}>
            {selectedTemplate && (
              <>
                <Typography variant="h5" gutterBottom>
                  {selectedTemplate.title}
                </Typography>
                <form>
                  <TextField
                    fullWidth
                    label="Title"
                    value={selectedTemplate.title}
                    sx={{ mb: 2 }}
                    disabled
                  />
                  <TextField
                    fullWidth
                    label="Description (JSON)"
                    value={JSON.stringify(selectedTemplate.description, null, 2)}
                    sx={{ mb: 2 }}
                    disabled
                    multiline
                    rows={4}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCloseModal}
                    sx={{ mt: 2 }}
                  >
                    Close
                  </Button>
                </form>
              </>
            )}
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};

export default FormTemplates;
