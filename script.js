const API_URL = "http://127.0.0.1:5000";
const slider = document.getElementById("lightSlider");
const visibilitySelect = document.getElementById("visibilitySelect");
const sliderValue = document.getElementById("sliderValue");
const intensityValue = document.getElementById("intensityValue");
const brightnessValue = document.getElementById("brightnessValue");
const lightStatus = document.getElementById("lightStatus");
const statusDescription = document.getElementById("statusDescription");
const modelStatus = document.getElementById("modelStatus");
const confidenceValue = document.getElementById("confidenceValue");
const connectionStatus = document.getElementById("connectionStatus");
const connectionDot = document.getElementById("connectionDot");
const highway = document.getElementById("highway");
const sceneLabel = document.getElementById("sceneLabel");
const decisionReason = document.getElementById("decisionReason");
const errorMessage = document.getElementById("errorMessage");
const dailyUsage = document.getElementById("dailyUsage");
const dailySavings = document.getElementById("dailySavings");
const savingsPercent = document.getElementById("savingsPercent");
const inputSummary = document.getElementById("inputSummary");
const logicSummary = document.getElementById("logicSummary");
let requestNumber = 0;
let backendOnline = false;

function updateEnergy(brightness) {
  updatePowerCalculator(brightness);
  const baseline = 12;
  const usage = baseline * brightness / 100;
  const saved = baseline - usage;
  dailyUsage.textContent = `${usage.toFixed(1)} kWh`;
  dailySavings.textContent = `${saved.toFixed(1)} kWh`;
  savingsPercent.textContent = `${(saved / baseline * 100).toFixed(0)}%`;
}
function updateHighway(intensity, status, visibility) {
  highway.classList.remove("day", "dim", "night", "lights-on", "dim-lights", "foggy", "rainy");
  if (intensity > 60) highway.classList.add("day");
  else if (intensity > 30) highway.classList.add("dim");
  else highway.classList.add("night");
  if (status === "ON") highway.classList.add("lights-on");
  if (status === "DIM") highway.classList.add("dim-lights");
  if (visibility === "fog") highway.classList.add("foggy");
  if (visibility === "rain") highway.classList.add("rainy");
  sceneLabel.textContent = `LIGHT: ${intensity}% · VISIBILITY: ${visibility.toUpperCase()} · ${backendOnline ? "AI" : "DEMO"}: ${status}`;
}
function localDemoPrediction(intensity, visibility) {
  // Explicitly labelled fallback for UI testing only; this is not an AI prediction.
  if (visibility === "rain" || visibility === "fog") return {status:"ON", brightness:100, confidence:null,
    message:`${visibility === "fog" ? "Fog" : "Rain"} selected: demo fallback keeps simulated lights ON.`};
  if (intensity <= 30) return {status:"ON", brightness:100, confidence:null, message:"Low ambient light: demo fallback recommends simulated lights ON."};
  if (intensity <= 60) return {status:"DIM", brightness:50, confidence:null, message:"Medium ambient light: demo fallback recommends DIM lighting."};
  return {status:"OFF", brightness:0, confidence:null, message:"Bright ambient light: demo fallback recommends simulated lights OFF."};
}
async function predictLighting() {
  const currentRequest = ++requestNumber;
  const intensity = Number(slider.value);
  const visibility = visibilitySelect.value;
  sliderValue.textContent = intensity;
  intensityValue.textContent = intensity;
  errorMessage.textContent = "";
  lightStatus.textContent = "Calculating…";
  statusDescription.textContent = "Evaluating current scenario";
  inputSummary.textContent = `Ambient image/sensor estimate ${intensity}% · ${visibility} visibility`;
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);
    let response;
    try {
      response = await fetch(`${API_URL}/predict`, {method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({intensity, visibility}), signal:controller.signal});
    } finally { window.clearTimeout(timeout); }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Prediction failed");
    if (currentRequest !== requestNumber) return;
    backendOnline = true;
    lightStatus.textContent = result.status;
    brightnessValue.textContent = result.brightness;
    confidenceValue.textContent = result.confidence ?? "--";
    statusDescription.textContent = result.message;
    modelStatus.textContent = "Random Forest · Online";
    connectionStatus.textContent = "AI Backend Online";
    connectionDot.classList.add("online");
    decisionReason.textContent = `AI prediction: ${result.status} at ${result.brightness}% simulated brightness. Confidence: ${result.confidence ?? "not provided"}%. ${result.message}`;
    logicSummary.textContent = `Random Forest model · ${result.confidence ?? "--"}% confidence · trained on synthetic examples`;
    updateHighway(intensity, result.status, visibility);
    updateEnergy(result.brightness);
  } catch (error) {
    if (currentRequest !== requestNumber) return;
    backendOnline = false;
    const result = localDemoPrediction(intensity, visibility);
    lightStatus.textContent = result.status;
    brightnessValue.textContent = result.brightness;
    confidenceValue.textContent = "--";
    statusDescription.textContent = result.message;
    modelStatus.textContent = "Local demo only";
    connectionStatus.textContent = "Backend Offline · Demo Mode";
    connectionDot.classList.remove("online");
    decisionReason.textContent = `DEMO FALLBACK — NOT AN AI PREDICTION. ${result.message} Start the backend for the Random Forest model.`;
    logicSummary.textContent = "Simple threshold rule fallback; AI model is offline";
    errorMessage.textContent = `Backend unavailable (${error.name === "AbortError" ? "request timed out" : error.message}). The dashboard remains testable in demo mode.`;
    updateHighway(intensity, result.status, visibility);
    updateEnergy(result.brightness);
  }
}
slider.addEventListener("input", predictLighting);
visibilitySelect.addEventListener("change", predictLighting);
document.querySelectorAll("[data-intensity]").forEach(button => button.addEventListener("click", () => { slider.value = button.dataset.intensity; predictLighting(); }));
async function checkBackend() {
  try { const r = await fetch(`${API_URL}/health`, {signal:AbortSignal.timeout(1800)}); backendOnline = r.ok; }
  catch (_) { backendOnline = false; }
  predictLighting();
}
checkBackend();

// Optional webcam brightness estimation: frames are processed locally in the browser.
const cameraVideo = document.getElementById("cameraVideo");
const cameraCanvas = document.getElementById("cameraCanvas");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");
const cameraIntensity = document.getElementById("cameraIntensity");
const cameraStatus = document.getElementById("cameraStatus");
const startCameraButton = document.getElementById("startCamera");
const stopCameraButton = document.getElementById("stopCamera");
const useCameraReadingButton = document.getElementById("useCameraReading");
let cameraStream = null, cameraTimer = null, latestCameraIntensity = null;
async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { cameraStatus.textContent = "Camera requires localhost/Live Server or HTTPS in a supported browser."; return; }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}, audio:false});
    cameraVideo.srcObject = cameraStream; cameraPlaceholder.style.display = "none";
    startCameraButton.disabled = true; stopCameraButton.disabled = false; useCameraReadingButton.disabled = false;
    cameraStatus.textContent = "Camera active. Point it at the scene to estimate image brightness.";
    cameraTimer = window.setInterval(sampleCameraBrightness, 800);
  } catch (error) { cameraStatus.textContent = `Could not start camera: ${error.message}. Check browser permission.`; }
}
function sampleCameraBrightness() {
  if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) return;
  cameraCanvas.width = 64; cameraCanvas.height = 48;
  const ctx = cameraCanvas.getContext("2d", {willReadFrequently:true}); ctx.drawImage(cameraVideo,0,0,64,48);
  const pixels = ctx.getImageData(0,0,64,48).data; let sum = 0, count = 0;
  for (let i=0;i<pixels.length;i+=4) { sum += .2126*pixels[i] + .7152*pixels[i+1] + .0722*pixels[i+2]; count++; }
  latestCameraIntensity = Math.round(sum/count/255*100); cameraIntensity.textContent = latestCameraIntensity;
  cameraStatus.textContent = `Camera active · estimated image brightness ${latestCameraIntensity}%.`;
}
function stopCamera() {
  if (cameraTimer !== null) { clearInterval(cameraTimer); cameraTimer = null; }
  if (cameraStream) { cameraStream.getTracks().forEach(track=>track.stop()); cameraStream=null; }
  if (cameraVideo) cameraVideo.srcObject=null;
  if (cameraPlaceholder) cameraPlaceholder.style.display="grid";
  if (startCameraButton) startCameraButton.disabled=false;
  if (stopCameraButton) stopCameraButton.disabled=true;
  if (useCameraReadingButton) useCameraReadingButton.disabled=true;
  if (cameraStatus) cameraStatus.textContent="Camera stopped.";
}
startCameraButton.addEventListener("click", startCamera);
stopCameraButton.addEventListener("click", stopCamera);
useCameraReadingButton.addEventListener("click",()=>{
  if (latestCameraIntensity===null) { cameraStatus.textContent="Wait until a camera brightness reading appears."; return; }
  slider.value=latestCameraIntensity; predictLighting(); cameraStatus.textContent=`Using camera-estimated intensity ${latestCameraIntensity}% for the lighting demo.`;
});
window.addEventListener("beforeunload",stopCamera);


// Detailed engineering estimate calculator. Values are illustrative assumptions.
const powerFields = ["lampWatt","lampCount","hoursPerDay","electricityRate","baselineDim","co2Factor"];
const powerEl = Object.fromEntries(powerFields.map(id => [id, document.getElementById(id)]));
let recommendedBrightness = 100;

function fmt(value, digits=1) {
  return Number(value).toLocaleString("en-IN", {minimumFractionDigits:digits, maximumFractionDigits:digits});
}
function updatePowerCalculator(brightness = recommendedBrightness) {
  recommendedBrightness = Math.max(0, Math.min(100, Number(brightness) || 0));
  if (!powerEl.lampWatt) return;
  const watts = Math.max(0, Number(powerEl.lampWatt.value) || 0);
  const lamps = Math.max(0, Number(powerEl.lampCount.value) || 0);
  const hours = Math.max(0, Math.min(24, Number(powerEl.hoursPerDay.value) || 0));
  const tariff = Math.max(0, Number(powerEl.electricityRate.value) || 0);
  const basePct = Math.max(0, Math.min(100, Number(powerEl.baselineDim.value) || 0));
  const co2Factor = Math.max(0, Number(powerEl.co2Factor.value) || 0);
  const baseline = watts * lamps * hours * (basePct / 100) / 1000;
  const smart = watts * lamps * hours * (recommendedBrightness / 100) / 1000;
  const saved = Math.max(0, baseline - smart);
  const pct = baseline > 0 ? saved / baseline * 100 : 0;
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  set("calcDailySaved", `${fmt(saved)} kWh`);
  set("calcDailySavedHint", `${fmt(recommendedBrightness,0)}% recommended average power`);
  set("calcBaseDaily", `${fmt(baseline)} kWh`);
  set("calcSmartDaily", `${fmt(smart)} kWh`);
  set("calcDailyCost", `₹${fmt(saved * tariff)}`);
  set("calcMonthlyCost", `₹${fmt(saved * tariff * 30)}`);
  set("calcYearlyCost", `₹${fmt(saved * tariff * 365)}`);
  set("calcYearlyEnergy", `${fmt(saved * 365)} kWh`);
  set("calcCO2", `${fmt(saved * 365 * co2Factor)} kg`);
  set("calcSavingsPct", `${fmt(pct,0)}% estimated savings`);
  set("baselineBarValue", `${fmt(baseline)} kWh`);
  set("smartBarValue", `${fmt(smart)} kWh`);
  const max = Math.max(baseline, smart, 0.01);
  const baseBar = document.getElementById("baselineBar");
  const smartBar = document.getElementById("smartBar");
  if (baseBar) baseBar.style.width = `${baseline / max * 100}%`;
  if (smartBar) smartBar.style.width = `${smart / max * 100}%`;
}
powerFields.forEach(id => {
  if (powerEl[id]) powerEl[id].addEventListener("input", () => updatePowerCalculator());
});

updatePowerCalculator(100);
