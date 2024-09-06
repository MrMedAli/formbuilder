// FormulaireList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FormulaireList = () => {
  const [formulaires, setFormulaires] = useState([]);

  useEffect(() => {
    const fetchFormulaires = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/formulaires/');
        setFormulaires(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des formulaires', error);
      }
    };

    fetchFormulaires();
  }, []);

  return (
    <div>
      <h1>Liste des Formulaires</h1>
      <ul>
        {formulaires.map(formulaire => (
          <li key={formulaire.id}>
            <h2>{formulaire.nom}</h2>
            <pre>{JSON.stringify(formulaire.fields, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormulaireList;
