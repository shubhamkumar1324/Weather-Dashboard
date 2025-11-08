# 🌤️ Weather Dashboard

Weather Dashboard is a modern and interactive **weather application** that provides real-time weather information, air quality index, UV index, wind direction compass, hourly temperature chart, weekly forecast, voice-based search, auto location detection, and theme switching — all built using **HTML, CSS, and JavaScript**.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🌍 **Global Weather Search** | Search weather for any city in the world |
| 🎙 **Voice Search** | Speak the city name to search |
| 📍 **Auto Location Detect** | Automatically fetches your current location weather |
| 🌞/🌙 **Light & Dark Theme** | Smooth theme toggle with memory (saved in localStorage) |
| 🎵 **Weather-Based Sounds** | Plays background ambience depending on weather (soft volume) |
| 📊 **Hourly Temperature Chart** | Interactive chart powered by Chart.js |
| 📅 **5-Day Forecast** | Next 5 days temperature + weather summary |
| 🧭 **Wind Compass** | Wind direction indicator with rotation |
| 🌫 **Air Quality Index** | Displays AQI level + category |
| ☀ **UV Index** | Shows UV strength with category levels |
| 📱 **Responsive UI** | Works on mobile, tablet, and desktop |

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | HTML, CSS, JavaScript |
| APIs Used | OpenWeather API, Air Pollution API, Open-Meteo UV API |
| Data Visualization | Chart.js |
| Geolocation | Native Browser API |

---

## 📂 Project Structure
Weather Dashboard/
│ index.html
│ style.css
│ script.js
└─ sounds/
├─ clear.mp3
├─ cloud.mp3
├─ rain.mp3
└─ wind.mp3

---

## 🚀 How to Run

1. Open the project folder in **VS Code**
2. Install **Live Server** extension (if not installed)
3. Right-click `index.html`
4. Select **Open with Live Server**

---

## 🧠 How It Works

- When you search a city or allow location, API data is fetched
- Weather condition determines:
  - UI theme color tone
  - Background sound
  - Weather icon
- The hourly and multi-day forecast are extracted and charted visually
- Wind direction is converted into degrees → rotated inside a compass
- Light/Dark Mode is saved and restored on reload

---

## 🤝 Contributing

Pull requests are welcome.  
For major changes, please open an issue first to discuss what you'd like to improve.

---

## 🏆 Author

**Shubham Kumar**

---



