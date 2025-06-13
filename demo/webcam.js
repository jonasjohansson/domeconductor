const canvasElement = document.getElementById("webcamCanvas");
const canvasCtx = canvasElement.getContext("2d");

const videoElement = document.createElement("video");
videoElement.style.display = "none";
document.body.appendChild(videoElement);

const bgVideo = document.getElementById("bgVideo");
const modelViewer = document.getElementById("ghostModel");
const startButton = document.getElementById("startButton");

const selfieSegmentation = new SelfieSegmentation({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
});

selfieSegmentation.setOptions({ modelSelection: 1 });

selfieSegmentation.onResults((results) => {
  canvasElement.width = results.image.width;
  canvasElement.height = results.image.height;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = "destination-in";
  canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = "source-in";
  canvasCtx.fillStyle = "rgba(100, 200, 255, 0.3)";
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.restore();
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await selfieSegmentation.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});

// Initial state: pause everything
bgVideo.pause();
modelViewer.pause();

startButton.addEventListener("click", () => {
  // Hide button
  startButton.style.display = "none";

  // Play background video
  bgVideo.play();

  // Start camera
  camera.start();

  // Trigger model animation (requires trick)
  modelViewer.play();
});
