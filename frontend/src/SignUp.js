import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './SignUp.module.css';
import NavigationBar from './NavigationBar';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const navigateLogin = (e) => {
    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:9091/http://127.0.0.1:5000/signup', {
        username,
        password,
      });

      if (response.status === 200) {
        // Login successful
        // setErrorMessage('');
        navigate('/face_signup'); // Replace '/new-page' with your desired route
      } else {
        // Login failed
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.log('An error occurred:', error);
    }
  };

  return (
    <div>
      <NavigationBar />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <h1 className={styles.loginTitle}>Publicis Sapient</h1>
          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
              className={styles.inputField}
            />
          </div>
          <div className={styles.inputContainer}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className={styles.inputField}
            />
          </div>
          <button type="submit" className={styles.signupButton}>
            Sign Up
          </button>
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
          <div className={styles.signupContainer}>
            <p>Already have an account</p>
            <a onClick={navigateLogin} className={styles.loginButton}>
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
