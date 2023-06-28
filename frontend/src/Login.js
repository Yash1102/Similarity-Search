import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';
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

  const navigateSignUp = () => {
    navigate('/signup');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:9091/http://127.0.0.1:5000/', {
        username,
        password,
      });

      if (response.status === 200) {
        navigate('/face');
      } else {
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
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
          <div className={styles.signupContainer}>
            <p>Don't have an account?</p>
            <a onClick={navigateSignUp} className={styles.signupButton}>
              Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
