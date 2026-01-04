(function() {
    // =========================================================================
    // CSS STYLES
    // =========================================================================
    const style = document.createElement('style');
    style.innerHTML = `
        /* --- DASHBOARD --- */
        .timer-dashboard {
            position: fixed; bottom: 10px; right: 10px; width: 95vw; max-width: 520px;
            min-width: 300px; min-height: 150px; /* Custom resize handle used */
            background: #1e1e1e; color: #e0e0e0;
            border: 1px solid #444; border-radius: 8px; z-index: 10000;
            font-family: 'Segoe UI', sans-serif; font-size: 11px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.9);
            display: flex; flex-direction: column;
            max-height: 500px;
        }
        .timer-dashboard.minimized { width: 300px !important; height: auto !important; resize: none; }
        .timer-dashboard.minimized .resize-handle-tl { display: none; }

        .resize-handle-tl {
            position: absolute; top: 0; left: 0; width: 15px; height: 15px;
            cursor: nw-resize; z-index: 10002;
            border-top: 3px solid #00a2ff; border-left: 3px solid #00a2ff;
            border-radius: 4px 0 0 0; transition: 0.2s;
        }
        .resize-handle-tl:hover { border-color: #fff; }
        
        .dash-header { padding: 8px 12px; background: #2d2d2d; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0; }
        .dash-controls { padding: 8px; background: #252525; border-bottom: 1px solid #333; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .dash-body { overflow-y: auto; flex: 1; }
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
        
        .tag-here { background: #0078d4; color: white; border: 1px solid #00a2ff; box-shadow: 0 0 5px #00a2ff; animation: pulse 2s infinite; }
        .tag-visited { background: #5c2d91; color: #e8d0ff; border: 1px solid #744da9; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }

        /* --- SERVER CARD STYLING --- */
        .rbx-game-server-item {
            height: auto !important;
            min-height: 320px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        /* --- LOCAL CONTROLS BLOCK --- */
        .local-controls { 
            display: block;
            margin-top: auto; margin-bottom: 5px; padding: 5px;
            background: #232527; border: 1px solid #444; border-radius: 6px; 
            width: 95%; margin-left: auto; margin-right: auto;
            box-sizing: border-box;
        }

        .controls-row { display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%; margin-bottom: 4px; }
        .controls-row:last-child { margin-bottom: 0; }

        .btn-preset { background: #393b3d; color: #ccc; font-size: 10px; padding: 4px 2px; border-radius: 3px; flex: 1; border: 1px solid #444; }
        .btn-preset:hover { background: #555; color: white; border-color: #666; }

        .input-timer { width: 50px !important; background: #111; border: 1px solid #444; color: white; padding: 2px 4px; border-radius: 3px; text-align: center; }

        .toggle-switch { position: relative; display: inline-block; width: 24px; height: 14px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #555; transition: .4s; border-radius: 14px; }
        input:checked + .slider { background-color: #2196F3; }
        input:checked + .slider:before { position: absolute; content: ""; height: 10px; width: 10px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; transform: translateX(0); }
        input:checked + .slider:before { transform: translateX(10px); }

        /* --- HELP MODAL --- */
        .help-modal { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(30,30,30,0.98); z-index: 10020; padding: 15px; overflow-y: auto; display: none; border-radius: 8px; }
        .help-modal.visible { display: block; }
        .help-content { color: #ddd; font-size: 12px; line-height: 1.5; }
        .help-content h1 { font-size: 16px; color: #00a2ff; border-bottom: 1px solid #444; padding-bottom: 5px; margin-top: 0; }
        .help-content h2 { font-size: 13px; color: #fff; margin: 12px 0 4px; font-weight: bold; }
        .help-content ul { padding-left: 20px; margin: 0; }
        .help-content li { margin-bottom: 4px; }
        .help-content code { background: #444; padding: 1px 4px; border-radius: 3px; font-family: monospace; color: #81d4fa; }
        .btn-close-help { float: right; background: #d83636; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; }
    `;
    document.head.appendChild(style);

    // =========================================================================
    // UI FUNCTIONS
    // =========================================================================
    RPT.createDashboard = function() {
        const dashboard = document.createElement('div');
        dashboard.className = 'timer-dashboard';
        dashboard.innerHTML = `
            <div id="resize-handle-tl" class="resize-handle-tl" title="Drag to Resize"></div>
            <div class="dash-header">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span>🛡️ <b>Portal Tracker v1.0</b></span>
                    <button id="btn-help" class="btn-icon" style="background:#00a2ff; width:18px; height:18px; line-height:14px; padding:0; border-radius:50%; font-weight:bold;" title="Help">?</button>
                </div>
                <button id="btn-minimize" class="btn-icon">_</button>
            </div>
            <div class="dash-controls">
                <div style="display:flex; gap:5px; align-items:center;">
                    <button id="btn-mute" class="btn-icon">🔊</button>
                    <input type="range" id="vol-slider" min="0" max="1" step="0.1" value="${RPT.state.volume}" style="width:60px">
                </div>
                <div style="display:flex; gap:5px; align-items:center; border-left:1px solid #444; padding-left:8px;">
                    <label class="toggle-switch"><input type="checkbox" id="chk-autostart" ${RPT.state.autoStart?'checked':''}><span class="slider"></span></label>
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
                    <thead><tr><th width="30">ID</th><th width="40">Mode</th><th>Status & Location</th><th width="70">Sync</th><th width="40">Go</th></tr></thead>
                    <tbody id="dash-rows"></tbody>
                </table>
            </div>
            <div id="help-modal" class="help-modal">
                <button id="btn-close-help" class="btn-close-help">Close</button>
                <div class="help-content">
                    <h1>📖 Help & Guide</h1>
                    
                    <h2>1. Modes (Checkbox)</h2>
                    <ul>
                        <li>
                            <b>Checked (Portal):</b> Use when a Portal is open.<br>
                            <img src="${chrome.runtime.getURL('imgs/portalcountdown.png')}" style="max-width:100%; border:1px solid #555; margin: 5px 0; border-radius: 4px;"><br>
                            Input the time shown in the countdown <b>PLUS 5 minutes</b> to track correctly.
                        </li>
                        <li style="margin-top: 10px;">
                            <b>Unchecked (Siege):</b> Use to track Siege spawn.<br>
                            <img src="${chrome.runtime.getURL('imgs/siege_w13.png')}" style="max-width:100%; border:1px solid #555; margin: 5px 0; border-radius: 4px;"><br>
                            Input = <code>Time until Spawn</code>.
                        </li>
                    </ul>
                    <h2>2. Tags</h2><ul><li><span class="tag-base tag-here">📍 HERE</span> : The server you are currently in (last clicked).</li><li><span class="tag-base tag-visited">👣 VISITED</span> : Servers you have previously joined. It's cleared everytime portals spawn so you keep track of each server you still need to visit.</li></ul>
                    <h2>3. How to Track</h2><ul><li>Find the <b>Local Controls</b> added to every server card.</li><li>Enter minutes in the box and click <b>▶</b>.</li><li><b>Sync:</b> Use <code>+30s</code> / <code>-30s</code> if timer is off.</li></ul>
                    <h2>4. Features</h2><ul><li><b>Go Button:</b> Scrolls to server.</li><li><b>AutoStart:</b> If ON, clicking "Join" starts timer.</li></ul>
                </div>
            </div>
        `;

        // Event Delegation for Checkboxes (Fixes event loss on re-render)
        dashboard.addEventListener('change', (e) => {
            if (e.target.classList.contains('chk-mode-toggle')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                
                let entry = null;
                for (const val of RPT.state.trackedServers.values()) {
                    if (val.id === id) { entry = val; break; }
                }

                if (entry) {
                    const isChecked = e.target.checked;
                    entry.mode = isChecked ? 'portal' : 'raid';
                    entry.timeLeft = (isChecked ? 600 : 1200);
                    entry.state = 'stopped';
                    entry.wasVisited = false;
                    if(entry.intervalId) clearInterval(entry.intervalId);
                    if(entry.inputElement) entry.inputElement.value = (isChecked ? 10 : 20);
                    RPT.renderDashboard();
                }
            }
        });

        document.body.appendChild(dashboard);
        return dashboard;
    };

    RPT.updateDisplayLocal = function(dsp, entry) {
        if(!dsp) return;
        const txt = RPT.formatTime(entry.timeLeft);
        if(entry.mode==='portal') {
            dsp.textContent = (entry.timeLeft>300 ? "ON " : "OFF ") + txt;
            dsp.style.color = (entry.timeLeft>300 ? "#00ff9d" : "#aaa");
        } else {
            dsp.textContent = txt;
            dsp.style.color = (entry.state==='finished'?'red':'white');
        }
    };

    RPT.createRow = function(entry) {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', entry.id);
        
        // ID
        const tdId = document.createElement('td');
        tdId.innerHTML = `<span style="color:#666">#</span>${entry.id}`;
        tr.appendChild(tdId);

        // MODE
        const tdMode = document.createElement('td');
        const chkMode = document.createElement('input'); 
        chkMode.type = 'checkbox'; 
        chkMode.className = 'chk-mode-toggle';
        chkMode.setAttribute('data-id', entry.id);
        chkMode.title = "Checkbox ON: Track Portals. Enter remaining portal time + 5 minutes.\nCheckbox OFF: Track Sieges. Enter time until siege spawn.";
        tdMode.appendChild(chkMode); 
        tr.appendChild(tdMode);

        // STATUS
        const tdStatus = document.createElement('td');
        tdStatus.className = 'col-status';
        tr.appendChild(tdStatus);

        // SYNC
        const tdSync = document.createElement('td');
        const btnSub = document.createElement('button'); btnSub.className='btn-nudge'; btnSub.textContent='-30s'; btnSub.onclick=()=>RPT.adjustTime(entry,-30);
        const btnAdd = document.createElement('button'); btnAdd.className='btn-nudge'; btnAdd.textContent='+30s'; btnAdd.onclick=()=>RPT.adjustTime(entry,30);
        tdSync.append(btnSub, btnAdd); 
        tr.appendChild(tdSync);

        // GO
        const tdGo = document.createElement('td');
        const btnGo = document.createElement('button'); btnGo.className='btn-locate'; btnGo.textContent='Go';
        btnGo.onclick = () => { 
            const b = entry.buttonElement;
            if(b && b.isConnected) { 
                b.scrollIntoView({behavior:'smooth', block:'center'});
                let c=0; const i=setInterval(()=>{ c++; b.style.opacity=(c%2===0)?'1':'0.3'; b.style.border=(c%2===0)?'2px solid red':''; if(c>6){clearInterval(i); b.style.opacity=''; b.style.border='';} },150);
            } 
        };
        tdGo.appendChild(btnGo); 
        tr.appendChild(tdGo);

        RPT.updateRow(tr, entry);
        return tr;
    };

    RPT.updateRow = function(tr, entry) {
        const chk = tr.querySelector('.chk-mode-toggle');
        if (chk) chk.checked = (entry.mode === 'portal');

        const tdStatus = tr.querySelector('.col-status');
        if (tdStatus) {
            let statusHTML = '', barColor = '#333', pct = 0, tagsHTML = '';
            if (entry.buttonElement === RPT.state.lastClickedButton) { tagsHTML += `<span class="tag-base tag-here">📍 HERE</span>`; if (!entry.wasVisited) entry.wasVisited = true; } 
            else if (entry.wasVisited) tagsHTML += `<span class="tag-base tag-visited">👣 VISITED</span>`;
            const tStr = RPT.formatTime(entry.timeLeft);
            if (entry.state === 'stopped') statusHTML = `<span style="color:#666">Stopped</span>`;
            else if (entry.mode === 'portal') {
                if (entry.timeLeft > 300) { tagsHTML = `<span class="tag-base tag-portal-on">PORTAL ON</span> ` + tagsHTML; statusHTML = `<b style="color:#00ff9d">${tStr}</b>`; pct = ((entry.timeLeft - 300)/300)*100; barColor = '#00ff9d'; }
                else { if(entry.timeLeft < 60) { tagsHTML = `<span class="tag-base tag-portal-warm">WARMUP</span> ` + tagsHTML; statusHTML = `<b style="color:#ffcc00">${tStr}</b>`; barColor = '#ffcc00'; } else { tagsHTML = `<span class="tag-base tag-portal-off">OFF</span> ` + tagsHTML; statusHTML = `<span style="color:#888">${tStr}</span>`; barColor = '#555'; } pct = (1 - (entry.timeLeft/300))*100; }
            } else { if (entry.state === 'finished') { statusHTML = `<b style="color:#ff4444">ENDED (${tStr})</b>`; barColor = 'red'; pct = 100; } else { statusHTML = `<span style="color:#00b06f">${tStr}</span>`; barColor = '#00b06f'; pct = (entry.timeLeft/1200)*100; } }
            tdStatus.innerHTML = `<div class="status-tags">${tagsHTML}</div><div style="display:flex; justify-content:space-between;">${statusHTML}</div><div class="progress-container"><div class="progress-bar" style="width:${pct}%; background:${barColor}"></div></div>`;
        }
    };

    RPT.renderDashboard = function() {
        if (RPT.state.isMinimized) return;
        const tbody = document.getElementById('dash-rows');
        if (!tbody) return;
        
        const existingRows = new Map();
        Array.from(tbody.children).forEach(tr => {
            const id = parseInt(tr.getAttribute('data-id'));
            if (!isNaN(id)) existingRows.set(id, tr);
        });

        const rows = Array.from(RPT.state.trackedServers.values());
        const filtered = rows.filter(r => {
            if (RPT.state.filterMode === 'active') return (r.mode === 'portal' && r.timeLeft >= 300) || (r.mode === 'raid' && r.state === 'running');
            return true;
        });
        filtered.sort((a, b) => {
            const getScore = (e) => {
                if (e.mode === 'portal') { if (e.timeLeft >= 300) return 2000 + e.timeLeft; if (e.timeLeft < 60) return 3000 - e.timeLeft; return 500; }
                if (e.state === 'finished') return 4000; if (e.state === 'running') return 1000; return 0;
            };
            return getScore(b) - getScore(a);
        });

        filtered.forEach(entry => {
            let tr = existingRows.get(entry.id);
            if (!tr) {
                tr = RPT.createRow(entry);
            } else {
                RPT.updateRow(tr, entry);
                existingRows.delete(entry.id);
            }
            tbody.appendChild(tr);
        });
        
        existingRows.forEach(tr => tr.remove());
    };

    RPT.createLocalControls = function(entry) {
        if (entry.controlsElement) return;
        const container = document.createElement('div'); container.className='local-controls';
        const row1 = document.createElement('div'); row1.className = 'controls-row';
        [5,10,120].forEach(m=>{ const b = document.createElement('button'); b.className='btn-preset'; b.textContent=m+'m'; b.onclick=(e)=>{ e.stopPropagation(); inp.value=m; }; row1.appendChild(b); });
        container.appendChild(row1);
        const row2 = document.createElement('div'); row2.className = 'controls-row';
        const inp = document.createElement('input'); inp.className = 'input-timer'; inp.type='number'; inp.value=(entry.mode==='portal'?10:20); inp.onclick=e=>e.stopPropagation();
        const btnP = document.createElement('button'); btnP.textContent='▶'; btnP.style.background='#00b06f'; btnP.className='btn-nudge';
        const btnS = document.createElement('button'); btnS.textContent='⏹'; btnS.style.background='#d83636'; btnS.className='btn-nudge';
        const dsp = document.createElement('span'); dsp.textContent='--:--'; dsp.style.fontFamily='monospace'; dsp.style.marginLeft='5px'; dsp.style.fontSize='10px';
        const start = () => {
            const v = parseFloat(inp.value); if(isNaN(v)) return;
            if(entry.intervalId) clearInterval(entry.intervalId);
            entry.timeLeft = Math.floor(v*60); entry.state='running'; entry.lastAudioPhase=null;
            if (entry.buttonElement === RPT.state.lastClickedButton) entry.wasVisited = true;
            RPT.updateDisplayLocal(dsp, entry); RPT.renderDashboard();
            entry.intervalId = setInterval(()=>{
                entry.timeLeft--;
                if(entry.mode==='portal') {
                    if(entry.timeLeft <= 0) { entry.timeLeft = 600; entry.wasVisited = false; RPT.renderDashboard(); }
                    if(entry.timeLeft===300 && entry.lastAudioPhase!=='open') { RPT.playAlert('portal_open'); entry.lastAudioPhase='open'; }
                    if(entry.timeLeft===30 && entry.lastAudioPhase!=='warm') { RPT.playAlert('warmup'); entry.lastAudioPhase='warm'; }
                } else { if(entry.timeLeft<=0) entry.state='finished'; }
                RPT.updateDisplayLocal(dsp, entry);
                RPT.renderDashboard();
            }, 1000);
        };
        btnP.onclick=(e)=>{e.stopPropagation(); start();};
        btnS.onclick=(e)=>{e.stopPropagation(); clearInterval(entry.intervalId); entry.state='stopped'; dsp.textContent='Stop'; dsp.style.color='#aaa'; RPT.renderDashboard();};
        row2.append(inp, btnP, btnS, dsp); container.appendChild(row2);
        const card = entry.buttonElement.closest('.rbx-game-server-item');
        if (card) card.appendChild(container); else entry.buttonElement.parentNode.appendChild(container);
        entry.controlsElement = container; entry.displayElement = dsp; entry.inputElement = inp; entry.startFn = start;
    };
})();