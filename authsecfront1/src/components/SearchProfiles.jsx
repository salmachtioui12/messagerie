import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DEFAULT_PROFILE_PICTURE = "https://via.placeholder.com/40?text=NA";

const SearchProfiles = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [images, setImages] = useState({});
  const navigate = useNavigate();

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
    if (role === "MANAGER") {
      navigate(`/profilecompany/${userId}?role=${role}`);
    } else {
      navigate(`/profilestudent/${userId}?role=${role}`);
    }
  };

  // Styles objet
  const styles = {
    container: {
      width: "100%",
      maxWidth: "800px",
      margin: "24px auto",
      padding: "0 16px"
    },
    searchInput: {
      width: "100%",
      padding: "8px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "9999px",
      fontSize: "14px",
      outline: "none",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      marginBottom: "12px"
    },
    resultsList: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      maxHeight: "350px",
      overflowY: "auto",
      marginTop: "12px",
      border: "1px solid #e5e7eb"
    },
    resultItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      cursor: "pointer",
      borderBottom: "1px solid #f3f4f6"
    },
    resultItemHover: {
      backgroundColor: "#f9fafb"
    },
    userInfo: {
      display: "flex",
      flexDirection: "column",
      flexGrow: 1
    },
    userName: {
      fontWeight: 600,
      color: "#111827",
      fontSize: "14px"
    },
    userRole: {
      color: "#6b7280",
      fontSize: "12px",
      marginTop: "4px"
    },
    userAvatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      objectFit: "cover",
      marginLeft: "12px"
    }
  };

  return (
    <div style={styles.container}>
      {/* Barre de recherche */}
      <input
        type="text"
        style={styles.searchInput}
        placeholder="🔍 Rechercher un profil..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* Résultats */}
      {results.length > 0 && (
        <ul style={styles.resultsList}>
          {results.map((user) => (
            <li
              key={user.userId}
              style={styles.resultItem}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
              onClick={() => handleProfileClick(user.userId, user.role)}
            >
              <div style={styles.userInfo}>
                <span style={styles.userName}>
                  {user.firstname} {user.lastname}
                </span>
                <span style={styles.userRole}>{user.role}</span>
              </div>
              <img
                src={images[user.userId] || DEFAULT_PROFILE_PICTURE}
                alt="Profile"
                style={styles.userAvatar}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchProfiles;