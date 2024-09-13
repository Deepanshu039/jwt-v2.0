import "./App.css";
import axios from "axios";
import { useState } from "react";
import {jwtDecode} from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const refreshToken = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/refresh", { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const axiosJWT = axios.create()

  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwtDecode(user.accessToken);
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer " + data.accessToken;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleSubmit = async (e) => {
    console.log("HIHIHIHHIHIHIHIIHIHH")
    e.preventDefault();
    try {
      console.log({username, password});
      const res = await axios.post("http://localhost:5000/api/login", { username, password });
      console.log("resssssssssssssssss", res.data);
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      await axiosJWT.delete("http://localhost:5000/api/users/" + id, {
        headers: { authorization: "Bearer " + user.accessToken },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };

  const handleLogout = async () => {
    // setIsLoading(true);
    try {
      const res = await axiosJWT.post(
        "http://localhost:5000/api/logout",
        { token: user.refreshToken },
        {
          headers: { authorization: "Bearer " + user.token },
        }
      );
      setUser(null);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container">
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.username}</b>.
          </span>
          <span>User Actions:</span>
          <button className="deleteButton" onClick={() => handleDelete(1)}>
            Delete Saran
          </button>
          <button className="deleteButton" onClick={() => handleDelete(2)}>
            Delete Rahul
          </button>
          <button className="deleteButton" onClick={() => handleDelete(3)}>
            Delete Kiwi
          </button>
          <button className="logoutButton" onClick={() => handleLogout()}>
              logout
            </button>
          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}
        </div>
      ) : (
        <div className="login">
          <form onSubmit={handleSubmit}>
            <span className="formTitle">Login</span>
            <input
              type="email"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submitButton">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;