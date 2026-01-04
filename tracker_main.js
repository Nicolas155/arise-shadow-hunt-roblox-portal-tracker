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

    document.getElementById('chk-autostart').onchange = (e) => { RPT.state.autoStart = e.target.checked; RPT.saveConfig(); };
    document.getElementById('chk-autoscroll').onchange = (e) => {
        RPT.state.autoScroll = e.target.checked;
        if (RPT.state.autoScroll) RPT.state.scrollInterval = setInterval(() => window.scrollBy({ top: 100, behavior: 'smooth' }), 2000);
        else clearInterval(RPT.state.scrollInterval);
    };
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
        if(entry.displayElement) RPT.updateDisplayLocal(entry.displayElement, entry);
        RPT.renderDashboard();
    };

    RPT.scan = function() {
        document.querySelectorAll('.rbx-public-game-server-join, .game-server-join-btn').forEach(btn => {
            if(!RPT.state.trackedServers.has(btn)) {
                RPT.state.serverCounter++;
                const entry = { id: RPT.state.serverCounter, buttonElement: btn, state: 'stopped', mode: 'raid', timeLeft: 0, intervalId: null, controlsElement: null, lastAudioPhase: null, wasVisited: false };
                RPT.state.trackedServers.set(btn, entry);
                RPT.createLocalControls(entry);
                RPT.renderDashboard();
            }
        });
    };

    setInterval(()=>{ RPT.scan(); }, 1000);

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
        RPT.renderDashboard();
    });
    console.log("%c Portal Tracker v1.0 - Modules Loaded ", "background: #5c2d91; color: white; font-size: 14px;");
})();