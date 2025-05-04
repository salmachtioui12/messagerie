import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Importer useNavigate

const DEFAULT_PROFILE_PICTURE = "https://via.placeholder.com/32?text=NA";

const SearchProfiles = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [images, setImages] = useState({});
  const navigate = useNavigate(); // Initialiser le hook navigate

  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword.trim()) {
        axios
          .get(`http://localhost:1217/api/search?keyword=${keyword}`)
          .then((res) => {
            setResults(res.data);
            fetchProfilePictures(res.data);
          })
          .catch((err) => console.error(err));
      } else {
        setResults([]);
        setImages({});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const fetchProfilePictures = async (users) => {
    const newImages = {};
    await Promise.all(
      users.map(async (user) => {
        try {
          const res = await axios.get(
            `http://localhost:1217/api/search/image?userId=${user.userId}&role=${user.role}`,
            { responseType: "blob" }
          );
          newImages[user.userId] = URL.createObjectURL(res.data);
        } catch (err) {
          newImages[user.userId] = DEFAULT_PROFILE_PICTURE;
        }
      })
    );
    setImages(newImages);
  };

  const handleProfileClick = (userId, role) => {
    // Rediriger vers la page de profil spécifique en fonction du rôle
    if (role === "MANAGER") {
      navigate(`/profilecompany/${userId}?role=${role}`); // Page pour les managers
    } else {
      navigate(`/profilestudent/${userId}?role=${role}`); // Page générique pour les utilisateurs
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      {/* Barre de recherche */}
      <input
        type="text"
        className="w-full px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring focus:border-blue-500"
        placeholder="Rechercher un profil..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* Résultats */}
      {results.length > 0 && (
        <ul className="mt-2 bg-white rounded-md shadow-sm max-h-[300px] overflow-y-auto divide-y divide-gray-100">
          {results.map((user) => (
            <li
              key={user.userId}
              className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 text-sm cursor-pointer"
              onClick={() => handleProfileClick(user.userId, user.role)} // Passer le role ici
            >
              {/* Image à gauche */}
              <img
                src={images[user.userId] || DEFAULT_PROFILE_PICTURE}
                alt="Profile"
                className="rounded-full object-cover"
                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
              />

              {/* Prénom + Nom avec taille augmentée */}
              <span className="font-medium text-base truncate">
                {user.firstname} {user.lastname}
              </span>

              {/* Rôle aligné à droite */}
              <span className="text-gray-500 text-xs ml-auto">{user.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchProfiles;
