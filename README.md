# SunSense AI — Intelligent Highway Lighting Optimizer

A judge-demo-ready software prototype for adaptive highway lighting. Includes a dashboard, simulated highway scene, optional webcam image-brightness estimate, a Flask API, a Random Forest classifier, and illustrative energy calculations.

## What is included
- **AI API**: Flask endpoint `/predict` returns simulated light status, recommended brightness, and model confidence. `/health` is a backend health check.
- **Virtual sensor**: slider and Night/Cloudy/Day presets.
- **Visibility scenarios**: clear/rain/fog are manual demo selections, not live weather detection.
- **Camera estimate**: browser locally estimates average frame brightness; only the percentage is sent when you click “Use camera reading”. This is not a calibrated lux sensor.
- **Energy analytics**: estimates based on an assumed 12 kWh/day at 100% brightness, not measured savings.
- **Offline fallback**: dashboard remains interactive if Flask is unavailable, and clearly labels the result “DEMO FALLBACK — NOT AN AI PREDICTION”.

## Windows quick start (recommended)
1. Extract the ZIP completely.
2. Open the extracted `SunSenseAI` folder in VS Code.
3. Double-click `START_BACKEND.bat`. Keep its terminal window open. It installs the required packages and starts Flask. The first install needs internet.
4. In your browser, open `http://127.0.0.1:5000/health`. You should see JSON with `"ok": true`.
5. Open `index.html` with VS Code Live Server (right-click → **Open with Live Server**). Use its localhost URL.
6. Move the slider or click Night/Cloudy/Day. For webcam estimation, click **Start camera** and allow permission; then click **Use camera reading**.

## Manual startup
Open a terminal in the extracted project folder:
```powershell
python -m pip install -r requirements.txt
python ai_backend/train_ai.py
python ai_backend/app.py
```
If the model file `ai_backend/sunsense_model.pkl` is already present, retraining is optional. Keep the Flask terminal open while using the site.

## Troubleshooting
- **Site can't be reached at port 5000**: `START_BACKEND.bat` is not running, or the terminal was closed. Run it again and keep it open.
- **Port already in use**: close the other SunSense backend terminal or restart the laptop; only one app should use port 5000.
- **Camera not starting**: use localhost/Live Server, allow camera permission in the browser, and close other apps using the webcam.
- **Python command not found**: install Python and select “Add Python to PATH”, then reopen VS Code.

## Suggested judge demo (60–90 seconds)
1. Show **Night 10%**: the prototype should recommend lighting ON.
2. Show **Cloudy 45%**: it should recommend DIM.
3. Show **Day 90%**: it should recommend OFF for clear visibility.
4. Select fog/rain to demonstrate the visibility scenario policy. Explain this is a manual simulated input.
5. Start the webcam and use the reading to show camera-assisted input.
6. Explain energy values are illustrative and the current ML model is trained on synthetic examples.

## Important limitations
This is a software prototype only. It does not operate physical streetlights, detect actual weather, or measure real energy savings. Training data is synthetic and model confidence is not proof of real-world accuracy. The webcam reading depends on scene composition and automatic exposure. A real deployment needs calibrated sensors, field-collected and independently validated data, safe failover behavior, cybersecurity review, and road-safety approval.


## Detailed Power Calculator (added)
The dashboard includes an editable estimate calculator for lamp rated watts, number of lamps, operating hours/day, electricity tariff, baseline average power, and grid emission factor.

Formulas:
- Daily energy (kWh) = lamp watts × lamp count × hours/day × average power fraction ÷ 1000
- Cost = energy × tariff
- Estimated savings = baseline energy − SunSense energy
- Estimated yearly CO₂ avoided = yearly energy savings × selected emission factor

The calculator uses the lighting recommendation as a simplified average power fraction. It is an illustrative model, not measured savings or a guarantee. Real installations require real lamp/driver power curves, calibrated measurements, field validation, and road-safety approval.


## Visual refresh
The dashboard now uses a premium midnight-blue interface, mint/cyan highlights, refined cards, glowing simulation lights, improved contrast, and responsive styling. Functionality and prototype/simulation caveats are preserved.


## Ultimate visual edition
Includes a designed hero panel, navigation refinements, ambient glow/orbit road illustration, premium cards, improved mobile responsiveness, and polished section spacing. The dashboard remains a software simulation; visual changes do not indicate real-world deployment.


## Contrast color edition
Updated the visual palette to charcoal/graphite backgrounds with separate mint, amber, violet, and soft-blue accents. The aim is clearer visual hierarchy instead of one continuous blue tone.


## Section contrast update
Dashboard areas now use separate surface treatments: warm amber warning banner, differentiated KPI cards, teal simulation panel, violet-tinted camera panel, olive/amber analytics panel, and green/navy power calculator. This is intended to make sections visually distinct rather than one continuous dark/blue surface.


## Separate Power Calculation page
- The dashboard no longer contains the detailed calculator section.
- Use the **Power Calculator** item in the sidebar to open `power-calculation/index.html` in its own folder/page.
- The calculator has a **Back to main dashboard** link.
- Energy, cost, and CO₂ figures are illustrative estimates based on editable assumptions, not measured field savings.
