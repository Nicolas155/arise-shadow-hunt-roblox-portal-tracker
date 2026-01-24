window.RPT = window.RPT || {};

(function() {
    RPT.CONFIG_KEY = 'roblox_timer_config_v3_en';
    RPT.SERVER_DATA_KEY = 'rpt_server_data_v1';
    
    RPT.state = {
        trackedServers: new Map(),
        lastClickedButton: null,
        serverCounter: 0,
        isMinimized: false,
        soundEnabled: true,
        apiEnabled: false,
        skipDeleteConfirm: false,
        volume: 0.5,
        filterMode: 'all', 
        filters: [],
        audioCtx: new (window.AudioContext || window.webkitAudioContext)(),
        scrollInterval: null
    };

    // Load Config
    const savedConfig = localStorage.getItem(RPT.CONFIG_KEY);
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        RPT.state.volume = parsed.volume ?? 0.5;
        RPT.state.soundEnabled = parsed.soundEnabled ?? true;
        RPT.state.apiEnabled = parsed.apiEnabled ?? false;
        RPT.state.skipDeleteConfirm = parsed.skipDeleteConfirm ?? false;
        RPT.state.filters = parsed.filters || [];
    }

    RPT.saveConfig = function() {
        localStorage.setItem(RPT.CONFIG_KEY, JSON.stringify({
            volume: RPT.state.volume,
            soundEnabled: RPT.state.soundEnabled,
            apiEnabled: RPT.state.apiEnabled,
            skipDeleteConfirm: RPT.state.skipDeleteConfirm,
            filters: RPT.state.filters
        }));
    };

    RPT.formatTime = function(s) {
        const neg = s < 0; const abs = Math.abs(s);
        const m = Math.floor(abs/60); const sc = abs%60;
        return `${neg?'-':''}${m<10?'0'+m:m}:${sc<10?'0'+sc:sc}`;
    };

    RPT.playAlert = function(type) {
        if (!RPT.state.soundEnabled || !RPT.state.audioCtx) return;
        if (RPT.state.audioCtx.state === 'suspended') RPT.state.audioCtx.resume();

        const osc = RPT.state.audioCtx.createOscillator();
        const gainNode = RPT.state.audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(RPT.state.audioCtx.destination);
        const now = RPT.state.audioCtx.currentTime;
        
        if (type === 'portal_open') { 
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1);
            gainNode.gain.setValueAtTime(RPT.state.volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        } else if (type === 'warmup') { 
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            gainNode.gain.setValueAtTime(RPT.state.volume * 0.5, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        }
    };

    RPT.saveServerState = function(entry) {
        if(!entry.serverId) {
            return;
        }
        const all = JSON.parse(localStorage.getItem(RPT.SERVER_DATA_KEY)||"{}");
        const now = Date.now();
        let target = null;
        if(entry.state==='running') target = now + (entry.timeLeft*1000);
        
        all[entry.serverId] = {
            mode: entry.mode,
            state: entry.state,
            targetTimestamp: target,
            savedTimeLeft: entry.timeLeft,
            wasVisited: entry.wasVisited
        };
        localStorage.setItem(RPT.SERVER_DATA_KEY, JSON.stringify(all));
    };
})();