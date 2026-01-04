window.RPT = window.RPT || {};

(function() {
    RPT.CONFIG_KEY = 'roblox_timer_config_v3_en';
    
    RPT.state = {
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
    const savedConfig = localStorage.getItem(RPT.CONFIG_KEY);
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        RPT.state.volume = parsed.volume ?? 0.5;
        RPT.state.soundEnabled = parsed.soundEnabled ?? true;
        RPT.state.autoStart = parsed.autoStart ?? false;
    }

    RPT.saveConfig = function() {
        localStorage.setItem(RPT.CONFIG_KEY, JSON.stringify({
            volume: RPT.state.volume,
            soundEnabled: RPT.state.soundEnabled,
            autoStart: RPT.state.autoStart
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
})();