import axios from "axios";

const API_URL = "http://localhost:1217/api/v1/profiles"; // Modifie si nécessaire
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1217/api/v1/profiles';

// Fonction pour récupérer le profil de l'étudiant par ID
export const getStudentProfileById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/user/${id}`); // Correction de la syntaxe avec backticks
    return response;
  } catch (error) {
    throw new Error("Error fetching student profile.");
  }
};

// Constante pour une image de profil par défaut
export const DEFAULT_PROFILE_PICTURE = "https://via.placeholder.com/150"; // URL de l'image par défaut
