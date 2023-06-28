import React, { useState } from 'react';
import axios from 'axios';
import NavigationBar from './NavigationBar';
import styles from './ThreatDetection.module.css';

function ThreatDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const headers = {
        'Content-Type': 'multipart/form-data',
      };

      axios
        .post('http://localhost:9091/http://127.0.0.1:5000/threat_detection', formData, { headers })
        .then((response) => {
          // Handle the response from the Flask API
          setApiResponse(response.data);
        })
        .catch((error) => {
          // Handle any errors
          console.error(error);
        });
    }
  };

  return (
    <>
      <NavigationBar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Welcome to Publicis Sapient Threat Detection</h1>
        <p>For Threat Detection first choose csv file which contains the details about the network and upload it by clicking on upload button</p>
        <div className={styles.contentContainer}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input className={styles.fileInput} type="file" accept=".csv" onChange={handleFileChange} />
            <button className={styles.submitButton} type="submit">
              Upload
            </button>
          </form>
          <div className={styles.response}>Threat Detection Output: {apiResponse}</div>
        </div>
      </div>
    </>
  );
}

export default ThreatDetection;
