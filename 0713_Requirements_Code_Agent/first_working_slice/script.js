const seedData = [
  {
    id: 1,
    dorm: '男一舍',
    room: 'B-204',
    category: '冷氣',
    description: '冷氣無法啟動，室內異常發熱。',
    status: 'submitted',
    technician: '未派工'
  },
  {
    id: 2,
    dorm: '女二舍',
    room: 'A-118',
    category: '電燈',
    description: '走廊燈不亮，請協助檢查。',
    status: 'pending',
    technician: '未派工'
  },
  {
    id: 3,
    dorm: '學人宿舍',
    room: 'C-005',
    category: '水龍頭',
    description: '浴室水龍頭漏水。',
    status: 'assigned',
    technician: '王維修'
  }
];

let tickets = JSON.parse(localStorage.getItem('repairTickets')) || seedData;

const roleButtons = document.querySelectorAll('.role-btn');
const panels = {
  student: document.getElementById('studentPanel'),
  manager: document.getElementById('managerPanel'),
  technician: document.getElementById('technicianPanel')
};

function renderAll() {
  renderManager();
  renderTechnician();
}

function renderManager() {
  const list = document.getElementById('managerList');
  list.innerHTML = tickets.map(ticket => `
    <div class="ticket">
      <span class="status ${ticket.status}">${ticket.statusLabel || mapStatus(ticket.status)}</span>
      <div>宿舍：${ticket.dorm}</div>
      <div>房號：${ticket.room}</div>
      <div>設備：${ticket.category}</div>
      <div>問題：${ticket.description}</div>
      <div>維修人員：${ticket.technician}</div>
      <div class="action-row">
        <select class="assign-select" data-id="${ticket.id}">
          <option value="未派工">未派工</option>
          <option value="王維修">王維修</option>
          <option value="李維修">李維修</option>
        </select>
        <button class="assign-btn" data-id="${ticket.id}">派工</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.assign-btn').forEach(btn => {
    btn.addEventListener('click', () => assignTicket(btn.dataset.id));
  });
}

function renderTechnician() {
  const list = document.getElementById('technicianList');
  list.innerHTML = tickets
    .filter(ticket => ticket.technician !== '未派工')
    .map(ticket => `
      <div class="ticket">
        <span class="status ${ticket.status}">${mapStatus(ticket.status)}</span>
        <div>宿舍：${ticket.dorm}</div>
        <div>房號：${ticket.room}</div>
        <div>設備：${ticket.category}</div>
        <div>備註：${ticket.description}</div>
        <div class="action-row">
          <button class="complete-btn" data-id="${ticket.id}">標記完成</button>
        </div>
      </div>
    `).join('');

  list.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', () => completeTicket(btn.dataset.id));
  });
}

function mapStatus(status) {
  const map = {
    submitted: '已提交',
    pending: '待派工',
    assigned: '已派工',
    done: '已完成'
  };
  return map[status] || status;
}

function assignTicket(id) {
  const select = document.querySelector(`.assign-select[data-id="${id}"]`);
  const technician = select.value;
  tickets = tickets.map(ticket => {
    if (ticket.id === Number(id)) {
      return { ...ticket, technician, status: technician === '未派工' ? 'pending' : 'assigned' };
    }
    return ticket;
  });
  saveTickets();
  renderAll();
}

function completeTicket(id) {
  tickets = tickets.map(ticket => {
    if (ticket.id === Number(id)) {
      return { ...ticket, status: 'done' };
    }
    return ticket;
  });
  saveTickets();
  renderAll();
}

function saveTickets() {
  localStorage.setItem('repairTickets', JSON.stringify(tickets));
}

roleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    roleButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.entries(panels).forEach(([role, panel]) => {
      panel.classList.toggle('active', role === btn.dataset.role);
    });
  });
});

document.getElementById('reportForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const payload = {
    id: Date.now(),
    dorm: document.getElementById('dorm').value,
    room: document.getElementById('room').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value,
    status: 'submitted',
    technician: '未派工'
  };

  tickets.unshift(payload);
  saveTickets();
  renderAll();
  document.getElementById('studentResult').innerHTML = `
    <strong>報修已送出</strong><br />
    案件編號：${payload.id}<br />
    狀態：${mapStatus(payload.status)}
  `;
  document.getElementById('reportForm').reset();
});

renderAll();
