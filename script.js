// ==========================================
// CONFIGURATION
// ==========================================
const ADMIN_PASSWORD = "1234"; // รหัสผ่านแก้ไข
const INITIAL_DATA = null;     // วาง JSON Export ที่นี่เพื่อให้คนอื่นเห็นข้อมูลเริ่มต้น

// ==========================================
// CORE LOGIC
// ==========================================

let teams = JSON.parse(localStorage.getItem('val_league_data')) || (INITIAL_DATA ? INITIAL_DATA.teams : initTeams());

function initTeams() {
    let t = [];
    for(let i=0; i<18; i++) {
        t.push({
            id: i,
            name: `TEAM ${String(i+1).padStart(2, '0')}`,
            group: i < 9 ? 'A' : 'B',
            win: 0, loss: 0, pts: 0,
            logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${i}`
        });
    }
    return t;
}

function checkAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        const pw = prompt("กรุณาใส่รหัสผ่านแอดมิน:");
        if (pw === ADMIN_PASSWORD) {
            document.body.classList.add('admin-verified');
        } else {
            alert("รหัสผ่านไม่ถูกต้อง");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

function updateScore(id, type) {
    let team = teams.find(t => t.id === id);
    if (type === 'win') { team.win++; team.pts += 3; }
    else if (type === 'loss') { team.loss++; }
    else if (type === 'reset') { team.win = 0; team.loss = 0; team.pts = 0; }
    saveAndRender();
}

function saveToData() {
    const state = { teams: teams };
    navigator.clipboard.writeText(JSON.stringify(state));
    alert("คัดลอกข้อมูล JSON แล้ว! นำไปวางใน INITIAL_DATA ในไฟล์ script.js");
}

function saveAndRender() {
    localStorage.setItem('val_league_data', JSON.stringify(teams));
    renderTables();
    renderAdmin();
}

function renderTables() {
    ['A', 'B'].forEach(group => {
        const tbody = document.getElementById(`table-${group.toLowerCase()}`);
        if(!tbody) return;

        // จัดอันดับตาม PTS > WIN > NAME
        const groupTeams = teams.filter(t => t.group === group)
            .sort((a, b) => b.pts - a.pts || b.win - a.win || a.name.localeCompare(b.name));
        
        tbody.innerHTML = groupTeams.map((t, i) => `
            <tr class="border-b border-gray-800 h-14 hover:bg-gray-800/30 transition-colors">
                <td class="font-bold text-gray-500 pl-2">${i+1}</td>
                <td>
                    <div class="flex items-center gap-3">
                        <img src="${t.logo}" class="team-logo">
                        <span class="font-bold uppercase">${t.name}</span>
                    </div>
                </td>
                <td class="text-center font-medium">${t.win}</td>
                <td class="text-center font-medium">${t.loss}</td>
                <td class="text-center text-[#ff4655] font-black text-lg">${t.pts}</td>
                <td class="admin-only">
                    <div class="flex gap-1 justify-center">
                        <button onclick="updateScore(${t.id}, 'win')" class="btn-score bg-green-600 text-white">+</button>
                        <button onclick="updateScore(${t.id}, 'loss')" class="btn-score bg-red-600 text-white">-</button>
                        <button onclick="updateScore(${t.id}, 'reset')" class="btn-score bg-gray-600">↺</button>
                    </div>
                </td>
            </tr>
        `).join('');
    });
}

function renderAdmin() {
    const container = document.getElementById('team-inputs');
    if(!container) return;
    container.innerHTML = teams.map((t, i) => `
        <div class="input-card">
            <p class="text-[10px] text-gray-500 mb-1 uppercase font-bold">Group ${t.group} - Slot ${i+1}</p>
            <input type="text" value="${t.name}" onchange="updateName(${i}, this.value)">
            <input type="file" accept="image/*" class="text-[10px] mt-2 block w-full" onchange="handleLogo(${i}, this)">
        </div>
    `).join('');
}

function handleLogo(index, input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            teams[index].logo = e.target.result;
            saveAndRender();
        };
        reader.readAsDataURL(file);
    }
}

function updateName(index, val) { 
    teams[index].name = val; 
    saveAndRender(); 
}

function toggleAdmin() { 
    document.getElementById('admin-panel').classList.toggle('hidden-panel'); 
    const icon = document.getElementById('toggle-icon');
    icon.innerText = document.getElementById('admin-panel').classList.contains('hidden-panel') ? '▶' : '◀';
}

function resetData() { 
    if(confirm("คุณต้องการล้างคะแนนและข้อมูลทั้งหมดใช่หรือไม่?")) { 
        teams = initTeams(); 
        saveAndRender(); 
    } 
}

window.onload = () => { 
    checkAdmin(); 
    saveAndRender(); 
};