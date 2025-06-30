const video = document.createElement('video');
video.autoplay = true;
video.playsInline = true;
video.style.display = 'none'; // vidéo invisible
document.body.appendChild(video);

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;

    // Attendre que la vidéo soit prête
    video.onloadedmetadata = () => {
      initHandpose();
    };
  })
  .catch(err => console.error("Erreur d'accès à la webcam : ", err));

async function initHandpose() {
  const model = await handpose.load();
  detectHands(model);
}

async function detectHands(model) {
  const predictions = await model.estimateHands(video);
  if (predictions.length > 0) {
    moveElement(predictions[0].landmarks);
  }
  requestAnimationFrame(() => detectHands(model));
}

function moveElement(landmarks) {
  const alienContainer = document.querySelector('.alien-container');
  const indexTip = landmarks[8]; // Bout de l’index

  const vw = video.videoWidth;
  const vh = video.videoHeight;

  if (!vw || !vh) return; // sécurité si pas prêt

  // Coordonnées normalisées
  const normX = indexTip[0] / vw;
  const normY = indexTip[1] / vh;

  // Miroir horizontal (caméra style selfie)
  const screenX = (1 - normX) * window.innerWidth;
  const screenY = normY * window.innerHeight;

  // Centrage
  alienContainer.style.position = 'fixed';
  alienContainer.style.left = `${screenX - alienContainer.offsetWidth / 2}px`;
  alienContainer.style.top = `${screenY - alienContainer.offsetHeight / 2}px`;
  alienContainer.style.bottom = 'auto';
}