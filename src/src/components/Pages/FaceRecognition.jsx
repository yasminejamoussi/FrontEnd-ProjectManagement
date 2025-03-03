import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

const FaceRecognition = ({ onSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        startWebcam();
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    const startWebcam = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Error accessing webcam:", error);
        });
    };

    const getLabeledFaceDescriptions = async () => {
      const labels = [ "yas"];
      return Promise.all(
        labels.map(async (label) => {
          const descriptions = [];
          try {
            const img = await faceapi.fetchImage(`/labels/${label}.jpg`);
            const detections = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detections) {
              descriptions.push(detections.descriptor);
            } else {
              console.warn(`No face detected in image for ${label}.`);
            }
          } catch (error) {
            console.error(`Error loading image for ${label}:`, error);
          }
          return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
      );
    };

    const handleVideoPlay = async () => {
      const labeledFaceDescriptors = await getLabeledFaceDescriptions();
      console.log("Labeled Face Descriptors:", labeledFaceDescriptors); // Log des descripteurs
    
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.8); // Seuil à 0.8
    
      const canvas = canvasRef.current;
      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };
      faceapi.matchDimensions(canvas, displaySize);
    
      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();
    
        console.log("Detections:", detections); // Log des détections
    
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    
        let recognized = false;
    
        resizedDetections.forEach((detection) => {
          const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
          console.log("Best Match:", bestMatch); // Log du meilleur match
    
          const box = detection.detection.box;
          let label = bestMatch.label;
          if (bestMatch.distance > 0.8) { // Seuil à 0.8
            label = "Unknown";
          } else {
            recognized = true;
          }
    
          const drawBox = new faceapi.draw.DrawBox(box, { label });
          drawBox.draw(canvas);
        });
    
        if (recognized) {
          console.log("Face recognized!"); // Log de reconnaissance réussie
          onSuccess();
        }
      }, 1000);
    };

    loadModels();
    if (videoRef.current) {
      videoRef.current.addEventListener("play", handleVideoPlay);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("play", handleVideoPlay);
      }
    };
  }, [onSuccess]);

  return (
    <div>
      <video ref={videoRef} width="640" height="480" autoPlay muted />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
};

export default FaceRecognition;