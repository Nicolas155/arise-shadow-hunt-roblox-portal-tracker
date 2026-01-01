# 📜 Portal Tracker Script - Release Notes

### **v6.0: The Localization & Tracking Update**
*Current Version*

* **🌍 Full English Localization:** The entire interface (Dashboard, Buttons, Status Messages, and Logs) has been translated to English.
* **📍 "You Are Here" Indicator:** Added a blue flashing tag **`📍 HERE`** to the Dashboard for the server currently selected/clicked.
* **👣 Cycle Tracking:** Added a purple **`👣 VISITED`** tag to servers you have already checked within the current portal cycle.
* **🔄 Smart Tag Reset:** The "Visited" status automatically clears when a specific server's timer hits `00:00` and resets to `10:00`, allowing you to track the next cycle accurately.
* **📉 Stability:** Improved table sorting logic to prevent visual confusion when statuses change rapidly.

---

### **v5.0: The Power User Update**
*Automation, Audio & Visualization*

* **🔊 Built-in Audio Alerts:** Implemented Web Audio API (no external files needed).
    * **Ding:** Plays when a Portal enters the **ON** phase (5:00 remaining).
    * **Bip:** Plays during **Warmup** (30s before opening).
    * **Controls:** Added Mute button and Volume Slider to the dashboard header.
* **💾 Data Persistence:** Settings (Volume, Auto-Start, Mute status) are now saved in `localStorage`, persisting across page refreshes (F5).
* **📊 Dashboard 2.0:**
    * **Progress Bars:** Added visual timeline bars within the table rows.
    * **Sync Controls:** Added **`+30s`** and **`-30s`** buttons to manually nudge timers if the game server is desynchronized.
    * **Filters:** Added a dropdown to toggle between "Show All" and "Show Active/ON Only".
* **🤖 Automation:**
    * **Auto-Start:** Option to automatically start the timer (defaulting to Portal Mode) after the 10s waiting period.
    * **Auto-Scroll:** Option to automatically scroll the page down to lazy-load more servers from the Roblox list.
* **🎨 Visual Overhaul:** Darker theme, refined CSS, and color-coded tags for statuses (Green for ON, Yellow for Warmup, Gray for OFF).

---

### **v4.0: The "Portal Mode" Update**
*Logic Split*

* **🔀 Dual Operation Modes:**
    * **Raid Mode:** Standard countdown. Counts into negatives when finished (e.g., `-00:45`). Turns **Red** upon completion.
    * **Portal Mode:** Infinite Loop. Counts down from 10 minutes. Automatically resets to 10:00 when it hits 0.
* **🔛 Portal Phases:**
    * **ON (10m - 5m):** Badge shows "PORTAL ON" (Green).
    * **OFF (5m - 0m):** Badge shows "PORTAL OFF" (Gray).
* **🎛️ Dashboard Toggles:** Added a toggle switch in the table to switch specific servers between Raid and Portal modes on the fly.

---

### **v3.0: The Quality of Life Update**
*Foundations*

* **⏱️ Quick Presets:** Added `5m`, `10m`, and `120m` buttons to the local controls to quickly set timer duration.
* **🔦 Visual Locator:** Clicking the **"Go"** button in the dashboard now scrolls to the specific Join button and flashes it (opacity/border blink effect) 5 times for easy spotting.
* **🔽 Minimizable Dashboard:** Added a minimize/maximize button (`_` / `+`) to the floating table to save screen space.
* **⚠️ Blinking Logic:** Fixed issues where the table would take up too much vertical space.