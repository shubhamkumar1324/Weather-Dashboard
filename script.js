
// ========= CONFIG =========
const API_KEY = "29507992f4525202520e34110971ab38";
const ICONS = {
  Clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
  Clouds: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
  Rain: "https://cdn-icons-png.flaticon.com/512/1163/1163657.png",
  Snow: "https://cdn-icons-png.flaticon.com/512/642/642102.png",
  Drizzle: "https://cdn-icons-png.flaticon.com/512/3076/3076129.png",
  Thunderstorm: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png",
  Mist: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
  Haze: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
  Smoke: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
  Dust: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
  Fog: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png"
};

// ========= ELEMENTS =========
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const voiceBtn = document.getElementById('voiceBtn');
const suggestions = document.getElementById('suggestions');
const placeEl = document.getElementById('place');
const updatedEl = document.getElementById('updatedTime');
const tempEl = document.getElementById('temp');
const unitLabel = document.getElementById('unitLabel');
const descEl = document.getElementById('desc');
const hiEl = document.getElementById('tHigh');
const loEl = document.getElementById('tLow');
const humidEl = document.getElementById('humidity');
const visEl = document.getElementById('visibility');
const presEl = document.getElementById('pressure');
const iconEl = document.getElementById('icon');
const windArrow = document.getElementById('windArrow');
const windSpeedEl = document.getElementById('windSpeed');
const windGustEl = document.getElementById('windGust');
const aqiValue = document.getElementById('aqiValue');
const aqiLabel = document.getElementById('aqiLabel');
const aqiNeedle = document.getElementById('aqiNeedle');
const uvValue = document.getElementById('uvValue');
const uvLabel = document.getElementById('uvLabel');
const miniRow = document.getElementById('miniRow');
const bg = document.getElementById('bg');
const hourlyCanvas = document.getElementById('hourlyChart');
const toC = document.getElementById('toC');
const toF = document.getElementById('toF');
const themeToggle = document.getElementById('themeToggle');

let currentUnit = localStorage.getItem('unit') || 'metric'; // or 'imperial'
let chart;
let userClicked = false;
document.addEventListener('pointerdown', ()=> userClicked = true);

// weather sounds
const soundMap = {
  Clear: "sounds/clear.mp3",
  Clouds: "sounds/cloud.mp3",
  Rain: "sounds/rain.mp3",
  Snow: "sounds/snow.mp3",
  Drizzle: "sounds/rain.mp3",
  Thunderstorm: "sounds/thunder.mp3"
};
let audio = new Audio();
audio.preload = "auto";

// ========= THEME =========
(function initTheme(){
  const saved = localStorage.getItem('theme') || 'light';
  document.body.className = saved;
  themeToggle.checked = (saved === 'dark');
})();

themeToggle.addEventListener('change', () => {
  const mode = themeToggle.checked ? 'dark' : 'light';
  document.body.className = mode;
  localStorage.setItem('theme', mode);
});

// ========= UNITS =========
function refreshUnitButtons(){
  if(currentUnit==='metric'){ toC.classList.add('active'); toF.classList.remove('active'); unitLabel.textContent='C'; }
  else { toF.classList.add('active'); toC.classList.remove('active'); unitLabel.textContent='F'; }
}
toC.addEventListener('click', ()=>{ currentUnit='metric'; localStorage.setItem('unit', currentUnit); refresh(); });
toF.addEventListener('click', ()=>{ currentUnit='imperial'; localStorage.setItem('unit', currentUnit); refresh(); });
refreshUnitButtons();

// ========= SEARCH =========
searchBtn.addEventListener('click', () => doSearch());
cityInput.addEventListener('keypress', (e)=>{ if(e.key==='Enter') doSearch(); });

function doSearch(){
  const q = cityInput.value.trim();
  if(!q) return;
  fetchByCity(q);
}

// Voice
voiceBtn.addEventListener('click', ()=>{
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert('Speech Recognition not supported'); return; }
  const r = new SR();
  r.start();
  r.onresult = (e)=>{
    const spoken = e.results[0][0].transcript.replace(/[^\w\s]/g,'');
    cityInput.value = spoken;
    doSearch();
  };
});

// Suggestions via GeoDB
cityInput.addEventListener('input', async ()=>{
  const q = cityInput.value.trim();
  if(q.length < 2){ suggestions.innerHTML = ''; return; }
  const url = `https://geodb-free-service.wirefreethought.com/v1/geo/cities?namePrefix=${encodeURIComponent(q)}&limit=6&sort=-population`;
  const res = await fetch(url);
  const data = await res.json();
  suggestions.innerHTML = data.data.map(c=>`<li>${c.city}, ${c.country}</li>`).join('');
});
suggestions.addEventListener('click', (e)=>{
  if(e.target.tagName==='LI'){
    cityInput.value = e.target.textContent;
    suggestions.innerHTML='';
    doSearch();
  }
});

// ========= GLOBAL STATE =========
let lastCoords = null;

// ========= DATA FETCHERS =========
async function fetchByCity(city){
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`;
  const res = await fetch(url);
  if(!res.ok){ alert('City not found'); return; }
  const data = await res.json();
  renderNow(data);
  lastCoords = data.coord;
  fetchHourlyAndDaily(data.coord.lat, data.coord.lon);
  fetchAQI(data.coord.lat, data.coord.lon);
  fetchUV(data.coord.lat, data.coord.lon);
}

async function fetchHourlyAndDaily(lat, lon){
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  renderHourly(data.list.slice(0, 8)); // next 24 hours
  renderMiniDaily(groupDaily(data.list).slice(0, 6));
}

function groupDaily(list){
  const byDate = {};
  list.forEach(it=>{
    const d = it.dt_txt.split(' ')[0];
    (byDate[d] = byDate[d] || []).push(it);
  });
  return Object.entries(byDate).map(([date, arr])=>{
    const temps = arr.map(x=>x.main.temp);
    const tMax = Math.round(Math.max(...temps));
    const tMin = Math.round(Math.min(...temps));
    const mid = arr[Math.floor(arr.length/2)];
    return { dt: mid.dt, max: tMax, min: tMin, main: mid.weather[0].main };
  }).filter((_,i)=>i>0);
}

async function fetchAQI(lat, lon){
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const aqi = data.list?.[0]?.main?.aqi || 0; // 1..5
  const scale = ['—','Good','Fair','Moderate','Poor','Very Poor'];
  aqiValue.textContent = aqi ? (aqi*50-25) : '--'; // approx mapping
  aqiLabel.textContent = scale[aqi] || '—';
  const deg = -90 + ((aqi-1)/4)*180; // rotate -90..+90
  aqiNeedle.style.transform = `translateX(-50%) rotate(${deg}deg)`;
}

async function fetchUV(lat, lon){
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  const uv = data.daily?.uv_index_max?.[0];
  if(uv==null){ uvValue.textContent='--'; uvLabel.textContent='—'; return; }
  uvValue.textContent = uv.toFixed(1);
  uvLabel.textContent = uv<3?'Low':uv<6?'Moderate':uv<8?'High':uv<11?'Very high':'Extreme';
}

// ========= RENDERERS =========
function renderNow(d){
  placeEl.textContent = d.name;
  updatedEl.textContent = new Date(d.dt*1000).toLocaleString();
  tempEl.textContent = Math.round(d.main.temp);
  descEl.textContent = d.weather[0].description;
  hiEl.textContent = Math.round(d.main.temp_max);
  loEl.textContent = Math.round(d.main.temp_min);
  humidEl.textContent = d.main.humidity;
  visEl.textContent = (d.visibility/1000).toFixed(1);
  presEl.textContent = d.main.pressure;
  windSpeedEl.textContent = (d.wind.speed).toFixed(1);
  windGustEl.textContent = d.wind.gust ? (d.wind.gust).toFixed(1) : '—';
  windArrow.style.transform = `translate(-50%, -100%) rotate(${d.wind.deg}deg)`;
  const main = d.weather[0].main;
  iconEl.src = ICONS[main] || ICONS['Clouds'];
  setBg(main.toLowerCase());

  // play sound after user interaction
  if(userClicked && soundMap[main]){
    try{
      audio.pause();
      audio.src = soundMap[main];
      audio.volume = 0.6;
      audio.play().catch(()=>{});
    }catch(e){}
  }
}

function renderHourly(list){
  const labels = list.map(x=>new Date(x.dt*1000).toLocaleTimeString([], {hour:'numeric'}));
  const temps = list.map(x=>Math.round(x.main.temp));
  if(chart){ chart.destroy(); }
  chart = new Chart(hourlyCanvas.getContext('2d'), {
    type:'line',
    data:{ labels, datasets:[{ label:'Temp', data:temps, tension:.35 }]},
    options:{
      responsive:true,
      plugins:{ legend:{display:false}},
      scales:{ y:{ ticks:{ callback:(v)=>v+'°'} } }
    }
  });
}

function renderMiniDaily(days){
  miniRow.innerHTML = days.map(d=>`
    <div class="item">
      <div class="day">${new Date(d.dt*1000).toLocaleDateString([], {weekday:'short'})}</div>
      <img src="${ICONS[d.main] || ICONS['Clouds']}" class="icon" alt=""/>
      <div>${d.max}° / ${d.min}°</div>
    </div>
  `).join('');
}

// ========= BG THEME =========
function setBg(main){
  bg.className = 'bg ' + (main.includes('rain')? 'rain' : main.includes('snow')? 'snow' : main.includes('cloud')? 'clouds' : 'clear');
}

// ========= INIT =========
function refresh(){
  refreshUnitButtons();
  if(lastCoords){
    fetchHourlyAndDaily(lastCoords.lat, lastCoords.lon);
    fetchAQI(lastCoords.lat, lastCoords.lon);
    fetchUV(lastCoords.lat, lastCoords.lon);
  }
  if(placeEl.textContent && placeEl.textContent !== '—'){
    fetchByCity(placeEl.textContent);
  }
}

if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(
    pos => {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=${currentUnit}&appid=${API_KEY}`)
        .then(r=>r.json())
        .then(d=>{
          renderNow(d);
          lastCoords = d.coord;
          fetchHourlyAndDaily(d.coord.lat, d.coord.lon);
          fetchAQI(d.coord.lat, d.coord.lon);
          fetchUV(d.coord.lat, d.coord.lon);
        })
        .catch(()=> fetchByCity('Hyderabad'));
    },
    ()=> fetchByCity('Hyderabad')
  );
} else {
  fetchByCity('Hyderabad');
}
