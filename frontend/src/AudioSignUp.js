import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import styles from './AudioSignUp.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AudioSignUp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const navigate = useNavigate();

  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const onStop = (recordedBlob) => {
    setAudioBlob(recordedBlob.blob);
  };

  const convertToWav = (audioBlob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.decodeAudioData(event.target.result, (buffer) => {
          const offlineContext = new OfflineAudioContext({
            numberOfChannels: buffer.numberOfChannels,
            length: buffer.length,
            sampleRate: buffer.sampleRate,
          });
          const source = offlineContext.createBufferSource();
          source.buffer = buffer;
          source.connect(offlineContext.destination);
          source.start(0);
          offlineContext.startRendering().then((renderedBuffer) => {
            const wavBlob = new Blob([getWavHeader(renderedBuffer), bufferToWave(renderedBuffer)]);
            resolve(wavBlob);
          }).catch((error) => {
            reject(error);
          });
        });
      };
      reader.readAsArrayBuffer(audioBlob);
    });
  };

  const getWavHeader = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitDepth = 16;
    const dataLength = audioBuffer.length * numChannels * (bitDepth / 8);
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + dataLength, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * 2, true);
    /* bits per sample */
    view.setUint16(34, bitDepth, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, dataLength, true);

    return buffer;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const bufferToWave = (buffer) => {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length * numChannels * 2;
    const view = new DataView(new ArrayBuffer(length));
    let offset = 0;

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        const pcm = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, pcm, true);
        offset += 2;
      }
    }

    return view;
  };

  const uploadAudio = async () => {
    try {
      const wavBlob = await convertToWav(audioBlob);

      const formData = new FormData();
      formData.append('audio', wavBlob, 'recording.wav');

      const response = await axios.post('http://localhost:9091/http://127.0.0.1:5000/audio_signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        // Login successful
        // setErrorMessage('');
        navigate('/'); // Replace '/new-page' with your desired route
        } 
      // Handle the response from the API
      console.log(response.data.message);
    } catch (error) {
      console.log('An error occurred:', error);
    }
  };

  const handleCaptureClick = () => {
    toast.promise(uploadAudio, {
      pending: 'Uploading audio...',
      success: 'Audio uploaded',
      error: 'Failed to upload photo.',
    });
  };

  return (
    <div className={styles.container}>
      <NavigationBar />
      <div className={styles.audioContainer}>
        <h1 className={styles.audioSpeech}>For audio similarity test say the following: <br/> My name is (your name) and i live in (your city)</h1>
        <ReactMic
          record={isRecording}
          onStop={onStop}
          mimeType="audio/wav"
          strokeColor="#777777"
          backgroundColor=" #dadae0"
          className={styles.reactMic}
        />
        <div className={styles.buttonContainer}>
          {isRecording ? (
            <button className={styles.stopButton} onClick={handleRecording}>
              Stop Recording
            </button>
          ) : (
            <button className={styles.recordButton} onClick={handleRecording}>
              Start Recording
            </button>
          )}
          <button className={styles.uploadButton} onClick={handleCaptureClick} disabled={!audioBlob}>
            Upload Audio
          </button>
          <ToastContainer position="top-center" />
        </div>
        {audioBlob && (
          <div className={styles.audioPlayer}>
            <audio controls src={URL.createObjectURL(audioBlob)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioSignUp;
