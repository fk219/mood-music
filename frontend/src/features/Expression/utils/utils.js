import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

const WASM_BASE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const stopStream = (stream) => {
  stream?.getTracks?.().forEach((track) => track.stop());
};

const describeCameraError = (error) => {
  const name = error?.name || "";

  if (!navigator.mediaDevices?.getUserMedia || name === "NotSupportedError") {
    return "This browser can’t open a camera here. Try a recent Chrome, Edge, or Safari, served over HTTPS.";
  }

  if (["NotAllowedError", "PermissionDeniedError", "SecurityError"].includes(name)) {
    return "Camera access is blocked. Allow camera permission for Moodify in your browser settings, then try again.";
  }

  if (["NotFoundError", "DevicesNotFoundError"].includes(name)) {
    return "No camera was found. Connect one, then try again.";
  }

  if (["NotReadableError", "TrackStartError"].includes(name)) {
    return "The camera is busy in another app. Close it, then try again.";
  }

  if (name === "OverconstrainedError") {
    return "This camera doesn’t support the requested video mode. Try another camera.";
  }

  return "The mood lens couldn’t start. Check your camera and connection, then try again.";
};

export async function initializeFaceExpression({
  videoRef,
  landmarkerRef,
  setExpression,
  setLoading,
  onStatus,
  onReady,
  onError,
  isCancelled,
}) {
  const cancelled = () => Boolean(isCancelled?.());

  if (landmarkerRef.current && videoRef.current?.srcObject) {
    setLoading(false);
    setExpression("Camera ready");
    onReady?.();
    return;
  }

  let stream = null;

  try {
    setLoading(true);
    setExpression("Starting camera...");

    if (!navigator.mediaDevices?.getUserMedia) {
      const unsupported = new Error("Camera API unavailable");
      unsupported.name = "NotSupportedError";
      throw unsupported;
    }

    if (!landmarkerRef.current) {
      onStatus?.("Loading the face model…");
      const vision = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
      if (cancelled()) return;

      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
      });

      if (cancelled()) {
        landmarker.close();
        return;
      }

      landmarkerRef.current = landmarker;
    }

    onStatus?.("Requesting camera access…");
    stream = await navigator.mediaDevices.getUserMedia({ video: true });

    if (cancelled() || !videoRef.current) {
      stopStream(stream);
      return;
    }

    videoRef.current.srcObject = stream;
    await videoRef.current.play();

    if (cancelled()) {
      stopStream(stream);
      return;
    }

    setLoading(false);
    setExpression("Camera ready");
    onStatus?.("Camera ready. Start a read when you like.");
    onReady?.();
  } catch (error) {
    stopStream(stream);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (cancelled()) return;

    console.error(error);
    setExpression("Camera unavailable");
    setLoading(false);
    onError?.(describeCameraError(error), error);
  }
}

export function startFaceDetection({
  videoRef,
  landmarkerRef,
  animationRef,
  setExpression,
  setIsRunning,
  onExpressionChange,
  onError,
}) {
  if (!landmarkerRef.current || !videoRef.current) {
    setIsRunning(false);
    onError?.("The camera isn’t ready yet. Give it a moment, then try again.");
    return;
  }

  setIsRunning(true);

  const detect = () => {
    if (!landmarkerRef.current || !videoRef.current) return;

    if (videoRef.current.readyState < 2) {
      animationRef.current = requestAnimationFrame(detect);
      return;
    }

    try {
      const result = landmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now(),
      );

      if (result.faceBlendshapes?.length > 0) {
        const blendshapes = result.faceBlendshapes[0].categories;
        const detectedExpression = classifyExpression(blendshapes);
        setExpression(detectedExpression);
        onExpressionChange?.(detectedExpression);
      } else {
        const detectedExpression = "No face detected";
        setExpression(detectedExpression);
        onExpressionChange?.(detectedExpression);
      }
    } catch (error) {
      console.error(error);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setIsRunning(false);
      onError?.("The lens lost the camera feed. Try starting a read again.");
      return;
    }

    animationRef.current = requestAnimationFrame(detect);
  };

  detect();
}

export function stopFaceDetection({ animationRef, setIsRunning }) {
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }

  setIsRunning?.(false);
}

export function stopFaceExpression({ videoRef, landmarkerRef, animationRef }) {
  stopFaceDetection({ animationRef });

  if (landmarkerRef.current) {
    landmarkerRef.current.close();
    landmarkerRef.current = null;
  }

  const stream = videoRef.current?.srcObject;

  if (stream) {
    stopStream(stream);
    videoRef.current.srcObject = null;
  }
}

export function classifyExpression(categories) {
  const getScore = (name) =>
    categories.find((item) => item.categoryName === name)?.score || 0;

  const smileLeft = getScore("mouthSmileLeft");
  const smileRight = getScore("mouthSmileRight");
  const jawOpen = getScore("jawOpen");
  const browUp = getScore("browInnerUp");
  const frownLeft = getScore("mouthFrownLeft");
  const frownRight = getScore("mouthFrownRight");

  if (smileLeft > 0.5 && smileRight > 0.5) {
    return "Happy 😄";
  }

  if (jawOpen > 0.6 && browUp > 0.5) {
    return "Surprised 😲";
  }

  if (frownLeft > 0.5 && frownRight > 0.5) {
    return "Sad 😢";
  }

  return "Neutral 😐";
}
