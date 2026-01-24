# ️ Roblox Portal Tracker v1.1

A powerful browser extension script designed to help players track **Portal** and **Siege** timers in *Arise: Shadow Hunt* directly from the Roblox server list page.

## 🚀 Features

### 1. 📊 Interactive Dashboard
*   **Floating Overlay:** A draggable, resizable, and minimizable dashboard that stays on top of the Roblox page.
*   **Live Status:** Shows the status of all tracked servers in real-time.
*   **Progress Bars:** Visual indicators for remaining time.

### 2. ⏱️ Dual Tracking Modes
*   **Portal Mode (Loop):**
    *   Designed for the 10-minute portal cycle.
    *   **Phases:**
        *   🟢 **ON:** Portal is open (10m - 5m).
        *   ⚪ **OFF:** Portal is closed (5m - 0m).
        *   🟡 **WARMUP:** Less than 60s until open.
    *   **Auto-Reset:** Automatically resets to 10:00 when the timer hits 0, clearing "Visited" tags for the new cycle.
*   **Siege Mode (One-time):**
    *   Standard countdown for Siege spawns.
    *   Turns 🔴 **RED** when the timer finishes.

### 3. 🎮 Server List Integration
*   **Local Controls:** Adds a control panel to every server card on the Roblox page.
*   **Quick Presets:** Buttons for `5m`, `10m`, and `120m`.
*   **Manual Input:** Type custom minutes (Max 10m for Portal Mode).
*   **Play/Stop:** Manually start or stop tracking specific servers.

### 4. 🔊 Audio Alerts
*   **Built-in Sounds:** No external files required.
    *   🔔 **Ding:** Plays when a Portal opens.
    *   ⚠️ **Bip:** Plays during the 30s warmup phase.
*   **Volume Control:** Slider and Mute button directly in the dashboard header.

### 5. 🤖 Automation & API
*   **API Integration:** Optional toggle to sync timers with an external Python OCR/Memory script.
    *   *Requires running the companion Python script.*
*   **Auto-Save:** Timers persist even if you refresh the page.
*   **Smart Restoration:** If you scroll down and load a server you were previously tracking, its timer restores automatically.

### 6. 🧭 Navigation & Management
*   **"Go" Button:** Instantly scrolls the page to the specific server card and flashes it **Red** for visibility.
*   **Sync Controls:** `+30s` / `-30s` buttons to adjust timers if they drift.
*   **Fast Delete:** Toggle to remove servers instantly without a confirmation popup.
*   **Data Wipe:** "Bomb" button (💣) to clear all stored data and start fresh.

### 7. 🔍 Filters & Tags
*   **Status Filters:** Toggle between "Show All" and "Show Active" (Running/Open).
*   **Keyword Filters:** Remove servers based on region or text (e.g., "Tokyo").
*   **Smart Tags:**
    *   📍 **HERE:** The server you last clicked/joined.
    *   👣 **VISITED:** Servers you've checked this cycle.
    *   🔥 **WARMUP:** Portals about to open.

## 📦 Installation
1.  Load the extension in your browser (Developer Mode).
2.  Navigate to the game's server list on Roblox.
3.  The dashboard will appear automatically.

## Automatic Tracking

If you want to track server automatically, check my other project that integrates via API with this extension.

<a href="https://github.com/Nicolas155/roblox-portal-tracker-screen-ocr" target="_blank" style="color:#00a2ff">GitHub Project</a>

---
*Current Version: v1.1*
