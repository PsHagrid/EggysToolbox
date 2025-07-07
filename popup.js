// Updated Chat Exporter UI Script
// Features: draggable UI, animated background, prettier selection, hidden scrollbar

(async function () {

  const chats = [...document.querySelectorAll('h4')]
    .map(h4 => {
      const title = h4.innerText.trim();
      const messages = [];
      let next = h4.nextElementSibling;
      while (next && next.tagName === 'PRE') {
        messages.push(next.innerText.trim());
        next = next.nextElementSibling;
      }
      return { title, messages };
    });

  if (!chats.length) return alert("❌ No conversations found!");

  const style = `
    #exporterPanel {
      position: fixed; top: 20px; left: 20px; z-index: 999999;
      width: 340px; max-height: 90vh; overflow-y: auto;
      background: radial-gradient(circle, #1b1b1b 0%, #111 100%);
      color: white; font-family: monospace;
      border: 2px solid #333; border-radius: 12px; padding: 15px;
      box-shadow: 0 0 30px rgba(0,0,0,0.8); animation: fadeIn 0.6s ease-in;
      cursor: grab;
    }
    #exporterPanel::-webkit-scrollbar { width: 0px; background: transparent; }
    #exporterPanel input[type="text"] {
      width: 100%; margin-bottom: 12px; padding: 6px;
      background: #1e1e1e; color: white; border: 1px solid #555; border-radius: 5px;
    }
    .chatRow {
      margin: 5px 0; padding: 6px 10px; border-radius: 6px;
      background: #222; transition: background 0.3s ease;
      display: flex; align-items: center; justify-content: space-between;
    }
    .chatRow:hover { background: #333; }
    .chatRow.selected { background: #444 !important; border-left: 4px solid lime; }
    .chatRow input { display: none; }
    .chatTitle { flex-grow: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; cursor: pointer; }
    #exportButton {
      margin-top: 12px; width: 100%; padding: 10px;
      background: limegreen; color: black; font-weight: bold;
      border: none; border-radius: 6px; cursor: pointer;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  const css = document.createElement('style');
  css.innerHTML = style;
  document.head.appendChild(css);

  const panel = document.createElement('div');
  panel.id = "exporterPanel";
  panel.innerHTML = `
    <div style="font-size:16px; margin-bottom:10px;">📂 <b>Chat Exporter</b></div>
    <input type="text" placeholder="Search chats..." id="chatSearch">
    <div id="chatList"></div>
    <button id="exportButton">📦 Export Selected (.zip)</button>
  `;
  document.body.appendChild(panel);

  const chatList = panel.querySelector('#chatList');
  const searchInput = panel.querySelector('#chatSearch');

  function renderChats(filter = "") {
    chatList.innerHTML = "";
    chats.forEach((chat, i) => {
      if (!chat.title.toLowerCase().includes(filter.toLowerCase())) return;
      const row = document.createElement('div');
      row.className = "chatRow";
      const safeTitle = chat.title.replace(/[\\/:*?"<>|]/g, '').slice(0, 40);
      row.innerHTML = `<label class="chatTitle" data-index="${i}">${safeTitle}</label><input type="checkbox" value="${i}">`;

      row.querySelector('.chatTitle').onclick = () => {
        row.classList.toggle('selected');
        const checkbox = row.querySelector('input');
        checkbox.checked = !checkbox.checked;
      };

      chatList.appendChild(row);
    });
  }

  searchInput.addEventListener("input", () => renderChats(searchInput.value));
  renderChats();

  document.querySelector('#exportButton').onclick = async () => {
    const selected = [...chatList.querySelectorAll("input:checked")].map(c => parseInt(c.value));
    if (!selected.length) return alert("No chats selected!");

    const zip = new JSZip();
    selected.forEach(i => {
      const chat = chats[i];
      const safeTitle = chat.title.replace(/[\\/:*?"<>|]/g, '').slice(0, 40);
      const text = `${chat.title}\n\n${chat.messages.join('\n\n')}`;
      zip.file(`${safeTitle || "Untitled"}.txt`, text);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Selected_Conversations.zip";
    link.click();
  };

  // Make draggable
  let offsetX, offsetY, isDragging = false;
  panel.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    panel.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panel.style.left = `${e.clientX - offsetX}px`;
    panel.style.top = `${e.clientY - offsetY}px`;
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    panel.style.cursor = 'grab';
  });
})();
