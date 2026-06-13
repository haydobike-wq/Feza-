// Firebase config değerleri buradan kolayca değiştirilebilir.
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const DEMO_MODE = true; // Gerçek Firebase bağlansa bile demo modu kapatmak için false yapın.
const DB_PATH = "/oxyHydroExplorer/status";
const STALE_THRESHOLD_MS = 10000;

const state = {
  connected: false,
  lastUpdate: null,
  activeData: null,
  demoActive: DEMO_MODE,
};

const elements = {
  connectionStatus: document.getElementById("connectionStatus"),
  freshnessStatus: document.getElementById("freshnessStatus"),
  systemSummary: document.getElementById("systemSummary"),
  lastUpdate: document.getElementById("lastUpdate"),
  humidity: document.getElementById("humidity"),
  temperature: document.getElementById("temperature"),
  lightState: document.getElementById("lightState"),
  energyMode: document.getElementById("energyMode"),
  waterLevel: document.getElementById("waterLevel"),
  electrolysisState: document.getElementById("electrolysisState"),
  hydrogenSafety: document.getElementById("hydrogenSafety"),
  oxygenStatus: document.getElementById("oxygenStatus"),
  motorSpeed: document.getElementById("motorSpeed"),
  servoAngle: document.getElementById("servoAngle"),
  emergencyState: document.getElementById("emergencyState"),
  systemMode: document.getElementById("systemMode"),
};

function applyStatusText(element, text, variant) {
  element.textContent = text;
  element.className = "";
  if (variant) element.classList.add(variant);
}

function formatDate(timestamp) {
  if (!timestamp) return "--";
  const date = new Date(timestamp);
  return date.toLocaleString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildSnapshotData(snapshot) {
  if (!snapshot || !snapshot.exists()) return null;
  return snapshot.val();
}

function getStatusClass(status) {
  if (status === "Güvenli") return "badge-success";
  if (status === "Uyarı") return "badge-warning";
  if (status === "Tehlike") return "badge-danger";
  if (status === "Gündüz") return "badge-day";
  if (status === "Gece") return "badge-night";
  return "";
}

function evaluateSystemSummary(data) {
  if (data.emergency) return "Acil durum aktif - dikkat!";
  if (!data.hydrogenRisk && data.oxygenAvailable) return "Sistem normal, oksijen üretimi aktif.";
  if (data.hydrogenRisk) return "Hidrojen riski algılandı, elektroliz durduruldu.";
  return "Veri alınıyor, sistem izleniyor.";
}

function getConnectionLabel() {
  return state.connected ? "Bağlı" : "DENEYAP Kart bağlantısı yok";
}

function getFreshnessLabel() {
  if (!state.lastUpdate) return "Veri bekleniyor";
  return Date.now() - state.lastUpdate > STALE_THRESHOLD_MS ? "Veri güncel değil" : "Veri güncel";
}

function getLightLabel(value) {
  if (!value) return "Bilinmiyor";
  return value === "DAY" ? "Gündüz" : "Gece";
}

function getEnergyModeLabel(value) {
  if (!value) return "Bilinmiyor";
  if (value.includes("HYDROGEN")) return "Hidrojen Enerji Simülasyon Modu";
  if (value.includes("SOLAR")) return "Güneş Enerjisi Modu";
  return value.replace(/_/g, " ");
}

function formatWaterLevel(value) {
  if (value === null || value === undefined) return "Bilinmiyor";
  return `${Math.round((value / 4095) * 100)} %`; // 12-bit ölçüm varsayımı
}

function updateDashboard(data) {
  const timestamp = data.updatedAt || Date.now();
  state.lastUpdate = timestamp;

  const lightLabel = getLightLabel(data.lightState);
  const energyLabel = getEnergyModeLabel(data.energyMode);
  const electrolysisLabel = data.hydrogenRisk ? "Durduruldu" : data.electrolysisActive ? "Aktif" : "Kapalı";
  const hydrogenLabel = data.hydrogenRisk ? "Tehlike" : "Güvenli";
  const oxygenLabel = data.oxygenAvailable ? "Üretim başladı" : "Beklemede";
  const emergencyLabel = data.emergency ? "Acil Durum" : "Normal";
  const summaryText = evaluateSystemSummary(data);

  applyStatusText(elements.systemSummary, summaryText);
  elements.lastUpdate.textContent = formatDate(timestamp);
  applyStatusText(elements.humidity, data.humidity !== null ? `${data.humidity} %` : "--", data.humidity >= 60 ? "badge-warning" : "badge-success");
  applyStatusText(elements.temperature, data.temperature !== null ? `${data.temperature.toFixed(1)} °C` : "--", data.temperature >= 40 || data.temperature <= 0 ? "badge-danger" : "badge-success");
  applyStatusText(elements.lightState, lightLabel, data.lightState === "DAY" ? "badge-day" : "badge-night");
  applyStatusText(elements.energyMode, energyLabel, energyLabel.includes("Güneş") ? "badge-day" : "badge-night");
  applyStatusText(elements.waterLevel, formatWaterLevel(data.waterLevelRaw), data.waterOk ? "badge-success" : "badge-warning");
  applyStatusText(elements.electrolysisState, electrolysisLabel, electrolysisLabel === "Durduruldu" ? "badge-danger" : "badge-success");
  applyStatusText(elements.hydrogenSafety, hydrogenLabel, hydrogenLabel === "Tehlike" ? "badge-danger" : "badge-success");
  applyStatusText(elements.oxygenStatus, oxygenLabel, data.oxygenAvailable ? "badge-success" : "badge-warning");
  applyStatusText(elements.motorSpeed, data.motorSpeed !== null ? `${data.motorSpeed} RPM` : "--", data.motorSpeed > 180 ? "badge-danger" : "badge-success");
  applyStatusText(elements.servoAngle, data.servoAngle !== null ? `${data.servoAngle}°` : "--", "");
  applyStatusText(elements.emergencyState, emergencyLabel, data.emergency ? "badge-danger" : "badge-success");
  applyStatusText(elements.systemMode, data.systemMode || "Bilinmiyor", data.systemMode === "AUTO" ? "badge-success" : "badge-warning");

  const freshness = getFreshnessLabel();
  applyStatusText(elements.freshnessStatus.querySelector("span"), freshness, freshness === "Veri güncel değil" ? "badge-danger" : "badge-success");
  applyStatusText(elements.connectionStatus.querySelector("span"), getConnectionLabel(), state.connected ? "badge-success" : "badge-danger");
}

function createDemoPayload() {
  const timestamp = Date.now();
  return {
    temperature: 22 + Math.random() * 14,
    humidity: 18 + Math.random() * 62,
    ldrRaw: Math.random() > 0.5 ? 3200 : 1800,
    lightState: Math.random() > 0.5 ? "DAY" : "NIGHT",
    energyMode: Math.random() > 0.5 ? "SOLAR_MODE" : "HYDROGEN_SIMULATION",
    waterLevelRaw: 1400 + Math.random() * 1800,
    waterOk: Math.random() > 0.17,
    hydrogenRaw: 320 + Math.random() * 260,
    hydrogenRisk: Math.random() > 0.88,
    oxygenRaw: Math.random() > 0.4 ? 21 + Math.random() * 6 : null,
    oxygenAvailable: Math.random() > 0.24,
    electrolysisActive: Math.random() > 0.2,
    fanActive: Math.random() > 0.35,
    emergency: Math.random() > 0.95,
    motorSpeed: Math.round(60 + Math.random() * 140),
    servoAngle: Math.round(40 + Math.random() * 100),
    joystickX: Math.round(1800 + Math.random() * 1200),
    joystickY: Math.round(1400 + Math.random() * 1600),
    systemMode: Math.random() > 0.5 ? "AUTO" : "MANUAL",
    updatedAt: timestamp,
  };
}

function initializeDemoMode() {
  state.connected = false;
  state.demoActive = true;
  state.activeData = createDemoPayload();
  updateDashboard(state.activeData);
  setInterval(() => {
    state.activeData = createDemoPayload();
    updateDashboard(state.activeData);
  }, 7000);
}

function initializeFirebase() {
  try {
    const app = firebase.initializeApp(FIREBASE_CONFIG);
    const database = firebase.database(app);
    const statusRef = database.ref(DB_PATH);

    firebase.database().ref(".info/connected").on("value", (snap) => {
      state.connected = snap.val() === true;
      if (!state.connected) {
        applyStatusText(elements.connectionStatus.querySelector("span"), getConnectionLabel(), "badge-danger");
      }
    });

    statusRef.on("value", (snapshot) => {
      const data = buildSnapshotData(snapshot);
      if (!data) {
        if (!state.demoActive) {
          applyStatusText(elements.connectionStatus.querySelector("span"), getConnectionLabel(), "badge-danger");
          applyStatusText(elements.freshnessStatus.querySelector("span"), "Veri yok", "badge-warning");
        }
        return;
      }

      state.demoActive = false;
      state.activeData = {
        ...data,
        updatedAt: data.updatedAt || Date.now(),
      };
      updateDashboard(state.activeData);
    }, (error) => {
      console.warn("Firebase okuma hatası:", error);
      if (state.demoActive) initializeDemoMode();
    });
  } catch (error) {
    console.warn("Firebase başlatılamadı:", error);
    initializeDemoMode();
  }
}

function setupPage() {
  applyStatusText(elements.connectionStatus.querySelector("span"), "Bağlantı kontrol ediliyor...", "badge-warning");
  applyStatusText(elements.freshnessStatus.querySelector("span"), "Veri bekleniyor", "badge-warning");

  if (DEMO_MODE) {
    initializeDemoMode();
    return;
  }

  initializeFirebase();
  setTimeout(() => {
    if (!state.connected && state.demoActive) {
      initializeDemoMode();
    }
  }, 6000);
}

window.addEventListener("DOMContentLoaded", setupPage);
