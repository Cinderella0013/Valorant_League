// 1. วางลิงก์ CSV จาก Google Sheets ตรงนี้
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSGe5hs_gUvn6ZUV-nsJG0qj7JuLCSuBO3AaStxd9D84DYa123FO4Wl9ToWaRICSN04KRZVNlBh3Xvs/pub?gid=0&single=true&output=csv";

let teams = [];

async function fetchData() {
    try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        
        // แยกบรรทัดและล้างช่องว่าง
        const rows = csvText.split('\n').map(row => row.trim()).filter(row => row !== "");
        const dataRows = rows.slice(1); // ข้ามหัวตาราง (Name, Win, Loss, Logo, Group)

        teams = dataRows.map((row, i) => {
            // ใช้ regex เพื่อแยกคอมมาที่ไม่ได้อยู่ในเครื่องหมายคำพูด (เผื่อชื่อทีมมีคอมมา)
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            const win = parseInt(cols[1]) || 0;
            const loss = parseInt(cols[2]) || 0;
            
            return {
                id: i,
                name: cols[0] ? cols[0].replace(/"/g, '') : `TEAM ${i+1}`,
                win: win,
                loss: loss,
                pts: win, // ชนะได้ 3 แต้ม
                logo: cols[3] ? cols[3].trim() : `https://api.dicebear.com/7.x/identicon/svg?seed=${i}`,
                group: cols[4] ? cols[4].trim().toUpperCase() : (i < 9 ? 'A' : 'B')
            };
        });

        renderTables();
    } catch (error) {
        console.error("ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้:", error);
    }
}

function renderTables() {
    ['A', 'B'].forEach(group => {
        const tbody = document.getElementById(`table-${group.toLowerCase()}`);
        if(!tbody) return;

        // กรองทีมตามกลุ่มและจัดลำดับ (แต้ม > จำนวนที่ชนะ > ชื่อ)
        const groupTeams = teams.filter(t => t.group === group)
            .sort((a, b) => b.pts - a.pts || b.win - a.win || a.name.localeCompare(b.name));
        
        tbody.innerHTML = groupTeams.map((t, i) => `
            <tr class="border-b border-gray-800 h-14 hover:bg-gray-800/30 transition-colors">
                <td class="font-bold text-gray-500 pl-2">${i+1}</td>
                <td>
                    <div class="flex items-center gap-3">
                        <img src="${t.logo}" class="team-logo" onerror="this.src='https://api.dicebear.com/7.x/identicon/svg?seed=${t.id}'">
                        <span class="font-bold uppercase">${t.name}</span>
                    </div>
                </td>
                <td class="text-center">${t.win}</td>
                <td class="text-center">${t.loss}</td>
                <td class="text-center text-[#ff4655] font-black text-lg">${t.pts}</td>
            </tr>
        `).join('');
    });
}

// โหลดข้อมูลครั้งแรกและอัปเดตทุก 1 นาที
window.onload = () => {
    fetchData();
    setInterval(fetchData, 60000); 

};

