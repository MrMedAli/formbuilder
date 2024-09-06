// FormView.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Container,
  Grid,
  CircularProgress
} from '@mui/material';

const FormView = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/formulaires/${id}/`);
        setForm(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération du formulaire', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  if (loading) return <CircularProgress style={{ display: 'block', margin: '20px auto' }} />;
  if (!form) return <Typography variant="h6" align="center">Aucun formulaire trouvé</Typography>;

  return (
    <Container maxWidth="md" style={{ paddingTop: '20px' }}>
      <Card>
        <CardHeader
          title={form.nom}
          titleTypographyProps={{ variant: 'h4' }}
          subheader="Détails du formulaire"
        />
        <Divider />
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Champs:
          </Typography>
          <List>
            {form.fields.map((field, index) => (
              <Card key={index} style={{ marginBottom: '10px' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Champ: {field.name} ({field.type})
                  </Typography>
                  {field.type === 'object' && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Champs object:
                      </Typography>
                      <List>
                        {field.fields.map((nestedField, nestedIndex) => (
                          <ListItem key={nestedIndex}>
                            <ListItemText
                              primary={`Champ: ${nestedField.name} (${nestedField.type})`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FormView;
