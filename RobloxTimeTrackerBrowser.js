(function() {
    // =========================================================================
    // 0. CONFIG & GLOBAL STATE
    // =========================================================================
    const CONFIG_KEY = 'roblox_timer_config_v2_en';
    
    const state = {
        trackedServers: new Map(),
        lastClickedButton: null,
        serverCounter: 0,
        isMinimized: false,
        autoScroll: false,
        soundEnabled: true,
        volume: 0.5,
        autoStart: false,
        filterMode: 'all', 
        audioCtx: new (window.AudioContext || window.webkitAudioContext)(),
        scrollInterval: null
    };

    // Load Config
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        state.volume = parsed.volume ?? 0.5;
        state.soundEnabled = parsed.soundEnabled ?? true;
        state.autoStart = parsed.autoStart ?? false;
    }

    function saveConfig() {
        localStorage.setItem(CONFIG_KEY, JSON.stringify({
            volume: state.volume,
            soundEnabled: state.soundEnabled,
            autoStart: state.autoStart
        }));
    }

    // =========================================================================
    // 1. AUDIO SYSTEM
    // =========================================================================
    function playAlert(type) {
        if (!state.soundEnabled || !state.audioCtx) return;
        if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

        const osc = state.audioCtx.createOscillator();
        const gainNode = state.audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(state.audioCtx.destination);
        const now = state.audioCtx.currentTime;
        
        if (type === 'portal_open') { // Ding (Open)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1);
            gainNode.gain.setValueAtTime(state.volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        } else if (type === 'warmup') { // Bip (Warmup)
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            gainNode.gain.setValueAtTime(state.volume * 0.5, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        }
    }

    // =========================================================================
    // 2. CSS STYLES
    // =========================================================================
    const style = document.createElement('style');
    style.innerHTML = `
        .timer-dashboard {
            position: fixed; bottom: 10px; right: 10px; width: 520px;
            background: #1e1e1e; color: #e0e0e0;
            border: 1px solid #444; border-radius: 8px; z-index: 10000;
            font-family: 'Segoe UI', sans-serif; font-size: 11px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.9);
            display: flex; flex-direction: column; transition: all 0.3s ease;
        }
        .timer-dashboard.minimized { width: 300px; height: auto; }
        
        .dash-header { padding: 8px 12px; background: #2d2d2d; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0; }
        .dash-controls { padding: 8px; background: #252525; border-bottom: 1px solid #333; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .dash-body { overflow-y: auto; max-height: 400px; }
        .timer-dashboard.minimized .dash-body, .timer-dashboard.minimized .dash-controls { display: none; }

        table { width: 100%; border-collapse: collapse; }
        th { background: #111; position: sticky; top: 0; padding: 6px; text-align: left; color: #888; z-index: 2; }
        td { padding: 5px 6px; border-bottom: 1px solid #333; vertical-align: middle; }
        
        .progress-container { width: 100%; height: 3px; background: #333; margin-top: 3px; border-radius: 2px; overflow: hidden; }
        .progress-bar { height: 100%; transition: width 1s linear; }

        button { cursor: pointer; border: none; border-radius: 3px; color: white; transition: 0.2s; }
        button:hover { opacity: 0.8; }
        .btn-icon { background: transparent; font-size: 14px; padding: 2px 5px; }
        .btn-nudge { background: #444; color: #ccc; font-size: 9px; padding: 1px 4px; margin: 0 1px; }
        .btn-locate { background: #00a2ff; padding: 2px 6px; font-size: 10px; }
        
        /* TAGS */
        .status-tags { display: flex; gap: 4px; margin-bottom: 2px; align-items: center; }
        .tag-base { padding: 1px 4px; border-radius: 3px; font-weight: bold; font-size: 9px; display: inline-block; text-align: center; }
        
        .tag-portal-on { background: rgba(0, 255, 157, 0.2); color: #00ff9d; border: 1px solid #00ff9d; }
        .tag-portal-off { background: rgba(100, 100, 100, 0.2); color: #aaa; border: 1px solid #555; }
        .tag-portal-warm { background: rgba(255, 204, 0, 0.2); color: #ffcc00; border: 1px solid #ffcc00; }
        
        /* LOCATION TAGS */
        .tag-here { background: #0078d4; color: white; border: 1px solid #00a2ff; box-shadow: 0 0 5px #00a2ff; animation: pulse 2s infinite; }
        .tag-visited { background: #5c2d91; color: #e8d0ff; border: 1px solid #744da9; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }

        .local-controls { margin-top: 4px; padding: 4px; background: #232527; border: 1px solid #fff; border-radius: 4px; display: flex; align-items: center; gap: 4px; width: fit-content; z-index: 999; }
        .toggle-switch { position: relative; display: inline-block; width: 24px; height: 14px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #555; transition: .4s; border-radius: 14px; }
        input:checked + .slider { background-color: #2196F3; }
        input:checked + .slider:before { position: absolute; content: ""; height: 10px; width: 10px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; transform: translateX(0); }
        input:checked + .slider:before { transform: translateX(10px); }
    `;
    document.head.appendChild(style);

    // =========================================================================
    // 3. UI DASHBOARD
    // =========================================================================
    const dashboard = document.createElement('div');
    dashboard.className = 'timer-dashboard';
    dashboard.innerHTML = `
        <div class="dash-header">
            <span>🛡️ <b>Portal Tracker v6</b></span>
            <button id="btn-minimize" class="btn-icon">_</button>
        </div>
        <div class="dash-controls">
            <div style="display:flex; gap:5px; align-items:center;">
                <button id="btn-mute" class="btn-icon">🔊</button>
                <input type="range" id="vol-slider" min="0" max="1" step="0.1" value="${state.volume}" style="width:60px">
            </div>
            <div style="display:flex; gap:5px; align-items:center; border-left:1px solid #444; padding-left:8px;">
                <label class="toggle-switch"><input type="checkbox" id="chk-autostart" ${state.autoStart?'checked':''}><span class="slider"></span></label>
                <span style="font-size:10px">AutoStart</span>
            </div>
            <div style="display:flex; gap:5px; align-items:center; border-left:1px solid #444; padding-left:8px;">
                <label class="toggle-switch"><input type="checkbox" id="chk-autoscroll"><span class="slider"></span></label>
                <span style="font-size:10px">Scroll</span>
            </div>
             <select id="sel-filter" style="background:#333; color:white; border:none; font-size:10px; margin-left:auto;">
                <option value="all">Show All</option>
                <option value="active">Show Active</option>
            </select>
        </div>
        <div class="dash-body">
            <table>
                <thead>
                    <tr>
                        <th width="30">ID</th>
                        <th width="40">Mode</th>
                        <th>Status & Location</th>
                        <th width="70">Sync</th>
                        <th width="40">Go</th>
                    </tr>
                </thead>
                <tbody id="dash-rows"></tbody>
            </table>
        </div>
    `;
    document.body.appendChild(dashboard);

    // UI Handlers
    const btnMin = document.getElementById('btn-minimize');
    btnMin.onclick = () => { state.isMinimized = !state.isMinimized; dashboard.classList.toggle('minimized', state.isMinimized); btnMin.textContent = state.isMinimized ? "+" : "_"; };

    const btnMute = document.getElementById('btn-mute');
    const volSlider = document.getElementById('vol-slider');
    function updateAudioUI() { btnMute.textContent = state.soundEnabled ? "🔊" : "🔇"; volSlider.disabled = !state.soundEnabled; }
    btnMute.onclick = () => { state.soundEnabled = !state.soundEnabled; updateAudioUI(); saveConfig(); if(state.audioCtx.state==='suspended') state.audioCtx.resume(); };
    volSlider.oninput = (e) => { state.volume = e.target.value; state.soundEnabled = true; updateAudioUI(); saveConfig(); };

    document.getElementById('chk-autostart').onchange = (e) => { state.autoStart = e.target.checked; saveConfig(); };
    document.getElementById('chk-autoscroll').onchange = (e) => {
        state.autoScroll = e.target.checked;
        if (state.autoScroll) state.scrollInterval = setInterval(() => window.scrollBy({ top: 100, behavior: 'smooth' }), 2000);
        else clearInterval(state.scrollInterval);
    };
    document.getElementById('sel-filter').onchange = (e) => { state.filterMode = e.target.value; renderDashboard(); };
    updateAudioUI();

    // =========================================================================
    // 4. LOGIC & RENDER
    // =========================================================================
    function formatTime(s) {
        const neg = s < 0; const abs = Math.abs(s);
        const m = Math.floor(abs/60); const sc = abs%60;
        return `${neg?'-':''}${m<10?'0'+m:m}:${sc<10?'0'+sc:sc}`;
    }

    function adjustTime(entry, s) {
        entry.timeLeft += s;
        // Adjust immediate visual feedback
        if(entry.displayElement) updateDisplayLocal(entry.displayElement, entry);
        renderDashboard();
    }

    function renderDashboard() {
        if (state.isMinimized) return;
        const tbody = document.getElementById('dash-rows');
        const rows = Array.from(state.trackedServers.values());

        // Filtering
        const filtered = rows.filter(r => {
            if (state.filterMode === 'active') {
                return (r.mode === 'portal' && r.timeLeft >= 300) || (r.mode === 'raid' && r.state === 'running');
            }
            return true;
        });

        // Sorting (Priority: Portal ON > Warmup > Raid Ended)
        filtered.sort((a, b) => {
            const getScore = (e) => {
                if (e.mode === 'portal') {
                    if (e.timeLeft >= 300) return 2000 + e.timeLeft; // High priority (ON)
                    if (e.timeLeft < 60) return 3000 - e.timeLeft; // Warmup (Almost opening is urgent)
                    return 500; // Cold
                }
                if (e.state === 'finished') return 4000; // Raid ended (Urgent)
                if (e.state === 'running') return 1000; 
                return 0;
            };
            return getScore(b) - getScore(a);
        });

        tbody.innerHTML = '';
        filtered.forEach(entry => {
            const tr = document.createElement('tr');

            // ID
            const tdId = document.createElement('td');
            tdId.innerHTML = `<span style="color:#666">#</span>${entry.id}`;
            tr.appendChild(tdId);

            // MODE
            const tdMode = document.createElement('td');
            const chkMode = document.createElement('input');
            chkMode.type = 'checkbox'; chkMode.checked = (entry.mode === 'portal');
            chkMode.onclick = () => {
                entry.mode = !chkMode.checked ? 'raid' : 'portal';
                entry.timeLeft = 600; entry.state = 'stopped';
                entry.wasVisited = false; // Reset on mode change
                clearInterval(entry.intervalId);
                createLocalControls(entry);
                renderDashboard();
            };
            tdMode.appendChild(chkMode);
            tr.appendChild(tdMode);

            // STATUS & LOCATION TAGS
            const tdStatus = document.createElement('td');
            let statusHTML = ''; let barColor = '#333'; let pct = 0; let tagsHTML = '';

            // Tag Logic
            if (entry.buttonElement === state.lastClickedButton) {
                // You are here NOW
                tagsHTML += `<span class="tag-base tag-here">📍 HERE</span>`;
                if (!entry.wasVisited) entry.wasVisited = true; // Mark as visited
            } else if (entry.wasVisited) {
                // You visited this cycle
                tagsHTML += `<span class="tag-base tag-visited">👣 VISITED</span>`;
            }

            // Time/State Logic
            const tStr = formatTime(entry.timeLeft);
            if (entry.state === 'waiting_10s') {
                statusHTML = `<span style="color:#ffcc00">Waiting...</span>`;
            } else if (entry.state === 'stopped') {
                statusHTML = `<span style="color:#666">Stopped</span>`;
            } else {
                if (entry.mode === 'portal') {
                    if (entry.timeLeft > 300) {
                        // ON
                        tagsHTML = `<span class="tag-base tag-portal-on">PORTAL ON</span> ` + tagsHTML;
                        statusHTML = `<b style="color:#00ff9d">${tStr}</b>`;
                        pct = ((entry.timeLeft - 300)/300)*100; barColor = '#00ff9d';
                    } else {
                        // OFF
                        if(entry.timeLeft < 60) {
                            tagsHTML = `<span class="tag-base tag-portal-warm">WARMUP</span> ` + tagsHTML;
                            statusHTML = `<b style="color:#ffcc00">${tStr}</b>`;
                            barColor = '#ffcc00';
                        } else {
                            tagsHTML = `<span class="tag-base tag-portal-off">OFF</span> ` + tagsHTML;
                            statusHTML = `<span style="color:#888">${tStr}</span>`;
                            barColor = '#555';
                        }
                        pct = (1 - (entry.timeLeft/300))*100;
                    }
                } else {
                    // Raid
                    if (entry.state === 'finished') {
                        statusHTML = `<b style="color:#ff4444">ENDED (${tStr})</b>`; barColor = 'red'; pct = 100;
                    } else {
                        statusHTML = `<span style="color:#00b06f">${tStr}</span>`; barColor = '#00b06f'; pct = (entry.timeLeft/1200)*100;
                    }
                }
            }

            tdStatus.innerHTML = `
                <div class="status-tags">${tagsHTML}</div>
                <div style="display:flex; justify-content:space-between;">${statusHTML}</div>
                <div class="progress-container"><div class="progress-bar" style="width:${pct}%; background:${barColor}"></div></div>
            `;
            tr.appendChild(tdStatus);

            // SYNC
            const tdSync = document.createElement('td');
            const btnSub = document.createElement('button'); btnSub.className='btn-nudge'; btnSub.textContent='-30s'; btnSub.onclick=()=>adjustTime(entry,-30);
            const btnAdd = document.createElement('button'); btnAdd.className='btn-nudge'; btnAdd.textContent='+30s'; btnAdd.onclick=()=>adjustTime(entry,30);
            tdSync.append(btnSub, btnAdd);
            tr.appendChild(tdSync);

            // GO
            const tdGo = document.createElement('td');
            const btnGo = document.createElement('button'); btnGo.className='btn-locate'; btnGo.textContent='Go';
            btnGo.onclick = () => {
                const b = entry.buttonElement;
                if(b && b.isConnected) {
                    b.scrollIntoView({behavior:'smooth', block:'center'});
                    // Blink effect
                    let c=0; const i=setInterval(()=>{
                        c++; b.style.opacity=(c%2===0)?'1':'0.3'; b.style.border=(c%2===0)?'1px solid grey':'2px solid white';
                        if(c>6){clearInterval(i); b.style.opacity=''; b.style.border='';}
                    },150);
                }
            };
            tdGo.appendChild(btnGo);
            tr.appendChild(tdGo);
            
            tbody.appendChild(tr);
        });
    }

    // =========================================================================
    // 5. LOCAL CONTROLS (JOIN BUTTON)
    // =========================================================================
    function createLocalControls(entry) {
        if (entry.controlsElement) entry.controlsElement.remove();
        const div = document.createElement('div'); div.className='local-controls';
        
        // Presets
        [5,10,120].forEach(m=>{
            const b = document.createElement('button'); b.className='btn-nudge'; b.textContent=m+'m';
            b.onclick=(e)=>{ e.stopPropagation(); inp.value=m; }; div.appendChild(b);
        });

        const inp = document.createElement('input'); inp.type='number'; inp.style.width='35px'; inp.value=(entry.mode==='portal'?10:20); inp.onclick=e=>e.stopPropagation();
        
        const btnP = document.createElement('button'); btnP.textContent='▶'; btnP.style.background='#00b06f'; btnP.className='btn-nudge';
        const btnS = document.createElement('button'); btnS.textContent='⏹'; btnS.style.background='#d83636'; btnS.className='btn-nudge';
        const dsp = document.createElement('span'); dsp.textContent='--:--'; dsp.style.fontFamily='monospace'; dsp.style.marginLeft='5px';

        const start = () => {
            const v = parseFloat(inp.value); if(isNaN(v)) return;
            if(entry.intervalId) clearInterval(entry.intervalId);
            entry.timeLeft = Math.floor(v*60); entry.state='running'; entry.lastAudioPhase=null;
            
            // Mark as visited on start
            if (entry.buttonElement === state.lastClickedButton) entry.wasVisited = true;

            updateDisplayLocal(dsp, entry); renderDashboard();

            entry.intervalId = setInterval(()=>{
                entry.timeLeft--;
                if(entry.mode==='portal') {
                    if(entry.timeLeft <= 0) {
                        // === RESET CYCLE ===
                        entry.timeLeft = 600; 
                        entry.wasVisited = false; // <--- RESET REQUESTED
                        renderDashboard(); // Force update table to remove tag
                    }
                    // Audio
                    if(entry.timeLeft===300 && entry.lastAudioPhase!=='open') { playAlert('portal_open'); entry.lastAudioPhase='open'; }
                    if(entry.timeLeft===30 && entry.lastAudioPhase!=='warm') { playAlert('warmup'); entry.lastAudioPhase='warm'; }
                } else {
                    if(entry.timeLeft<=0) entry.state='finished';
                }
                updateDisplayLocal(dsp, entry);
            }, 1000);
        };

        btnP.onclick=(e)=>{e.stopPropagation(); start();};
        btnS.onclick=(e)=>{e.stopPropagation(); clearInterval(entry.intervalId); entry.state='stopped'; dsp.textContent='Stopped'; dsp.style.color='#aaa'; renderDashboard();};

        div.append(inp, btnP, btnS, dsp);
        entry.buttonElement.parentNode.appendChild(div);
        entry.controlsElement = div; entry.displayElement = dsp; entry.startFn = start;
    }

    function updateDisplayLocal(dsp, entry) {
        if(!dsp) return;
        const txt = formatTime(entry.timeLeft);
        if(entry.mode==='portal') {
            dsp.textContent = (entry.timeLeft>300 ? "ON " : "OFF ") + txt;
            dsp.style.color = (entry.timeLeft>300 ? "#00ff9d" : "#aaa");
        } else {
            dsp.textContent = txt;
            dsp.style.color = (entry.state==='finished'?'red':'white');
        }
    }

    // =========================================================================
    // 6. MAIN LOOP & EVENTS
    // =========================================================================
    function scan() {
        document.querySelectorAll('.rbx-public-game-server-join').forEach(btn => {
            if(!state.trackedServers.has(btn)) {
                state.serverCounter++;
                state.trackedServers.set(btn, {
                    id: state.serverCounter, buttonElement: btn,
                    state: 'waiting_click', mode: 'raid', timeLeft: 0,
                    intervalId: null, controlsElement: null, lastAudioPhase: null,
                    wasVisited: false // New state
                });
                renderDashboard();
            }
        });
    }
    setInterval(()=>{ scan(); renderDashboard(); }, 1000);

    document.body.addEventListener('click', (e) => {
        if(state.audioCtx && state.audioCtx.state==='suspended') state.audioCtx.resume();
        const btn = e.target.closest('.rbx-public-game-server-join');
        if(!btn) return;
        if(!state.trackedServers.has(btn)) scan();
        
        const entry = state.trackedServers.get(btn);
        
        // Highlight logic
        if(state.lastClickedButton && state.lastClickedButton!==btn) state.lastClickedButton.style.backgroundColor="";
        state.lastClickedButton = btn;
        btn.style.backgroundColor="yellow"; btn.style.color="black";
        
        // Mark as visited immediately upon click
        entry.wasVisited = true;
        renderDashboard();

        if(btn.dataset.hasTimer==="true") return;
        btn.dataset.hasTimer="true"; entry.state='waiting_10s';
        renderDashboard();
        
        const orgTxt = btn.textContent;
        btn.textContent = "Waiting (10s)...";
        setTimeout(()=>{
            if(!btn.isConnected) { state.trackedServers.delete(btn); return; }
            btn.textContent = orgTxt; entry.state='stopped';
            createLocalControls(entry);
            if(state.autoStart) { entry.mode='portal'; entry.startFn(); }
            renderDashboard();
        }, 10000);
    });

    console.log("%c Portal Tracker v6 - Location Tags Enabled (EN) ", "background: #5c2d91; color: white; font-size: 14px;");
})();