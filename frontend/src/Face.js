import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from './NavigationBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Face.module.css';
import myimage from './PS_Logo_RGB.svg.png'

const Face = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const captureAndUpload = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);

    try {
      const blob = await fetch(imageSrc).then((r) => r.blob());

      const formData = new FormData();
      formData.append('image', blob, 'captured.jpg');

      const response = await axios.post('http://localhost:9091/http://127.0.0.1:5000/face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        navigate('/audio');
      } else {
        setErrorMessage(response.data.message);
      }
      console.log(response.data.message);
    } catch (error) {
      console.log('An error occurred:', error);
    }
  };

  const handleCaptureClick = () => {
    toast.promise(captureAndUpload(), {
      pending: 'Uploading photo...',
      success: 'Snapshot uploaded',
      error: 'Failed to upload photo.',
    });
  };

  return (
    <div>
      <NavigationBar />
      <div className={styles.container}>
        <div className={styles.captureContainer}>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className={styles.webcam} />
          <button onClick={handleCaptureClick} className={styles.captureButton}>
            Capture and Upload Photo
          </button>
          <ToastContainer position="top-center" />
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Face;
