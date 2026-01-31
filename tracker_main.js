(function() {
    // Init UI
    const dashboard = RPT.createDashboard();

    // UI Handlers
    const btnMin = document.getElementById('btn-minimize');
    btnMin.onclick = () => { RPT.state.isMinimized = !RPT.state.isMinimized; dashboard.classList.toggle('minimized', RPT.state.isMinimized); btnMin.textContent = RPT.state.isMinimized ? "+" : "_"; };

    const btnMute = document.getElementById('btn-mute');
    const volSlider = document.getElementById('vol-slider');
    function updateAudioUI() { btnMute.textContent = RPT.state.soundEnabled ? "🔊" : "🔇"; volSlider.disabled = !RPT.state.soundEnabled; }
    btnMute.onclick = () => { RPT.state.soundEnabled = !RPT.state.soundEnabled; updateAudioUI(); RPT.saveConfig(); if(RPT.state.audioCtx.state==='suspended') RPT.state.audioCtx.resume(); };
    volSlider.oninput = (e) => { RPT.state.volume = e.target.value; RPT.state.soundEnabled = true; updateAudioUI(); RPT.saveConfig(); };

    document.getElementById('chk-api').onchange = (e) => { 
        RPT.state.apiEnabled = e.target.checked; 
        RPT.saveConfig();
        if(RPT.state.apiEnabled) pollApi();
    };
    document.getElementById('chk-skip-confirm').onchange = (e) => { RPT.state.skipDeleteConfirm = e.target.checked; RPT.saveConfig(); };
    document.getElementById('sel-filter').onchange = (e) => { RPT.state.filterMode = e.target.value; RPT.renderDashboard(); };
    updateAudioUI();

    // Help Modal Logic
    const helpModal = document.getElementById('help-modal');
    document.getElementById('btn-help').onclick = () => helpModal.classList.add('visible');
    document.getElementById('btn-close-help').onclick = () => helpModal.classList.remove('visible');

    // Custom Resize Logic (Top-Left)
    const resizer = document.getElementById('resize-handle-tl');
    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        dashboard.style.maxHeight = 'none';
        const startX = e.clientX; const startY = e.clientY;
        const startW = dashboard.offsetWidth; const startH = dashboard.offsetHeight;
        const onMove = (e) => {
            const w = startW - (e.clientX - startX); const h = startH - (e.clientY - startY);
            if (w > 300) dashboard.style.width = w + 'px'; if (h > 150) dashboard.style.height = h + 'px';
        };
        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    });

    // Logic Functions
    RPT.adjustTime = function(entry, s) {
        entry.timeLeft += s;
        if(entry.targetTimestamp) entry.targetTimestamp += (s * 1000);
        if(entry.displayElement) RPT.updateDisplayLocal(entry.displayElement, entry);
        RPT.saveServerState(entry);
        RPT.renderDashboard();
    };

    RPT.scan = function() {
        const savedData = JSON.parse(localStorage.getItem(RPT.SERVER_DATA_KEY)||"{}");
        
        const getServerId = (btn) => {
            // 1. Try the list item container directly (often holds the data attributes)
            const li = btn.closest('li');
            if (li) {
                const sid = li.getAttribute('data-server-id');
                if (sid) return sid;
                const did = li.getAttribute('data-id');
                if (did) return did;
            }

            // 2. Try the card class
            const card = btn.closest('.rbx-game-server-item');
            if(card) {
                let id = card.getAttribute('data-server-id') || card.getAttribute('data-id');
                if(id) return id;

                const debug = card.querySelector('.rbx-public-server-debug-info');
                if(debug) {
                    // Try explicit "id:" format
                    let m = debug.textContent.match(/id:\s*([^\s]+)/i);
                    if(m) return m[1];
                    // Try finding a UUID (JobId format)
                    m = debug.textContent.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
                    if(m) return m[0];
                }
            }
            return null;
        };

        const restoreData = (entry, s) => {
             entry.mode = s.mode || 'raid';
             entry.wasVisited = s.wasVisited || false;
             if(s.state === 'running' && s.targetTimestamp) {
                 entry.targetTimestamp = s.targetTimestamp;
                 const diff = Math.floor((s.targetTimestamp - Date.now()) / 1000);
                 if(entry.mode === 'portal') {
                     if (diff > 0) {
                         entry.timeLeft = diff;
                     } else {
                         const cyclePos = (-diff) % 600;
                         entry.timeLeft = 600 - cyclePos;
                     }
                 } else {
                     entry.timeLeft = diff;
                 }
                 if(entry.startFn) entry.startFn(true);
             } else {
                 entry.timeLeft = s.savedTimeLeft || 0;
                 if(entry.inputElement) entry.inputElement.value = (entry.timeLeft/60).toFixed(2);
             }
        };

        // 1. Retry missing IDs for existing tracked servers
        RPT.state.trackedServers.forEach((entry, btn) => {
            if(!entry.serverId) {
                const id = getServerId(btn);
                if(id) {
                    entry.serverId = id;
                    if(savedData[id]) {
                        restoreData(entry, savedData[id]);
                        RPT.renderDashboard();
                    } else if (entry.state === 'running' || entry.mode === 'portal') {
                        RPT.saveServerState(entry);
                    }
                }
            }
        });

        // 2. Scan for new buttons
        const container = document.getElementById('rbx-public-running-games');
        const buttons = container ? container.querySelectorAll('.rbx-public-game-server-join, .game-server-join-btn') : [];
        buttons.forEach(btn => {
            if(!RPT.state.trackedServers.has(btn)) {
                RPT.state.serverCounter++;
                const entry = { id: RPT.state.serverCounter, buttonElement: btn, state: 'stopped', mode: 'portal', timeLeft: 600, intervalId: null, controlsElement: null, lastAudioPhase: null, wasVisited: false };
                
                entry.serverId = getServerId(btn);

                RPT.state.trackedServers.set(btn, entry);
                RPT.createLocalControls(entry);

                if(entry.serverId && savedData[entry.serverId]) {
                    restoreData(entry, savedData[entry.serverId]);
                }

                RPT.renderDashboard();
            }
        });
    };

    setInterval(()=>{ RPT.scan(); }, 1000);

    let pollIgnoreCount = 0;
    const pollApi = () => {
        if (!RPT.state.apiEnabled) return;

        fetch('http://localhost:4000/status')
            .then(r => r.json())
            .then(d => {
                if(!RPT.state.lastClickedButton) return;
                const entry = RPT.state.trackedServers.get(RPT.state.lastClickedButton);
                if(!entry) return;

                pollIgnoreCount++;
                if(pollIgnoreCount <= 3) return;

                if(!d || !d.roblox_pid) return;

                if (RPT.state.stalePid && d.roblox_pid === RPT.state.stalePid) return;
                RPT.state.currentPid = d.roblox_pid;
                RPT.state.stalePid = null;

                if(d.countdown) {
                    const t = d.countdown.split(':').map(Number);
                    if(t.length===2 && (t[0]>0 || t[1]>0)) {
                        entry.mode = 'portal';
                        entry.timeLeft = (t[0]*60 + t[1] + 300);
                        if(entry.inputElement) entry.inputElement.value = (entry.timeLeft/60).toFixed(4);
                        if(entry.state !== 'running') entry.startFn();
                        RPT.renderDashboard();
                    }
                }
            }).catch(()=>{});
    };
    RPT.state.apiPollInterval = setInterval(pollApi, 2000);

    document.body.addEventListener('click', (e) => {
        if(RPT.state.audioCtx && RPT.state.audioCtx.state==='suspended') RPT.state.audioCtx.resume();
        const btn = e.target.closest('.rbx-public-game-server-join, .game-server-join-btn');
        if(!btn) return;
        if(!RPT.state.trackedServers.has(btn)) RPT.scan();
        const entry = RPT.state.trackedServers.get(btn);
        if(!entry) return;
        if(RPT.state.lastClickedButton && RPT.state.lastClickedButton!==btn) RPT.state.lastClickedButton.style.backgroundColor="";
        RPT.state.lastClickedButton = btn; btn.style.backgroundColor="yellow"; btn.style.color="black";
        entry.wasVisited = true;
        if (RPT.state.autoStart && entry.state !== 'running') entry.startFn();

        if (RPT.state.apiPollInterval) clearInterval(RPT.state.apiPollInterval);
        if (RPT.state.currentPid) RPT.state.stalePid = RPT.state.currentPid;

        let pollIgnoreCount = 0;
        const pollApi = () => {
            fetch('http://localhost:4000/status')
                .then(r => r.json())
                .then(d => {
                    if(RPT.state.lastClickedButton !== btn) return;

                    pollIgnoreCount++;
                    if(pollIgnoreCount <= 3) return;

                    if(!d || !d.roblox_pid) return;

                    if (RPT.state.stalePid && d.roblox_pid === RPT.state.stalePid) return;
                    RPT.state.currentPid = d.roblox_pid;
                    RPT.state.stalePid = null;

                    if(d.countdown) {
                        const t = d.countdown.split(':').map(Number);
                        if(t.length===2 && (t[0]>0 || t[1]>0)) {
                            entry.mode = 'portal';
                            entry.timeLeft = (t[0]*60 + t[1] + 300);
                            if(entry.inputElement) entry.inputElement.value = (entry.timeLeft/60).toFixed(4);
                            if(entry.state !== 'running') entry.startFn();
                            RPT.renderDashboard();
                        }
                    }
                }).catch(()=>{});
        };
        pollApi();
        RPT.state.apiPollInterval = setInterval(pollApi, 2000);

        RPT.renderDashboard();
    });
    console.log("%c Portal Tracker v1.2 - Modules Loaded ", "background: #5c2d91; color: white; font-size: 14px;");
})();