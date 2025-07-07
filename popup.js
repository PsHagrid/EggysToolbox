function injectChatExporter() {
  (async function () {
    const selectedChats = new Set();

    const chats = [...document.querySelectorAll('h4')].map(h4 => {
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
        background: #111; color: white;
        font-family: monospace;
        border: 2px solid #333; border-radius: 12px; padding: 15px;
        box-shadow: 0 0 30px rgba(0,0,0,0.8); animation: fadeIn 0.5s ease-in;
        cursor: grab;
      }
      #exporterPanel::-webkit-scrollbar { width: 0px; background: transparent; }
      #exporterPanel input[type="text"] {
        width: 100%; margin-bottom: 12px; padding: 6px;
        background: #222; color: white; border: 1px solid #444; border-radius: 5px;
      }
      .chatRow {
        margin: 6px 0; padding: 6px 10px; border-radius: 6px;
        background: #222; transition: background 0.3s ease;
        display: flex; align-items: center; justify-content: space-between;
      }
      .chatRow:hover { background: #2c2c2c; }
      .chatRow.selected {
        background: #333 !important;
        border-left: 4px solid limegreen;
      }
      .chatRow input { display: none; }
      .chatTitle {
        flex-grow: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
      }
      #deselectButton {
        margin-top: 8px; width: 100%; padding: 10px;
        background: #555; color: white;
        font-weight: bold; border: none; border-radius: 6px;
        cursor: pointer; transition: background 0.2s ease-in-out;
      }
      #deselectButton:hover {
        background: #666;
      }
      #exportButton {
        position: sticky; bottom: 0; left: 0;
        margin-top: 12px; width: 100%; padding: 10px;
        background: limegreen; color: black;
        font-weight: bold; border: none; border-radius: 6px;
        cursor: pointer; transition: background 0.2s ease-in-out;
        z-index: 10;
      }
      #exportButton:hover {
        background: #90ee90;
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
      <button id="deselectButton">❌ Deselect All</button>
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

        const checkbox = row.querySelector('input');
        checkbox.checked = selectedChats.has(i);
        if (checkbox.checked) row.classList.add('selected');

        row.querySelector('.chatTitle').onclick = () => {
          checkbox.checked = !checkbox.checked;
          row.classList.toggle('selected', checkbox.checked);
          if (checkbox.checked) {
            selectedChats.add(i);
          } else {
            selectedChats.delete(i);
          }
        };

        chatList.appendChild(row);
      });
    }

    searchInput.addEventListener("input", () => renderChats(searchInput.value));
    renderChats();

    document.querySelector('#deselectButton').onclick = () => {
      selectedChats.clear();
      [...chatList.querySelectorAll(".chatRow")].forEach(row => {
        row.querySelector('input').checked = false;
        row.classList.remove('selected');
      });
    };

    document.querySelector('#exportButton').onclick = async () => {
      const selected = [...selectedChats];
      if (!selected.length) return alert("No chats selected!");

      const zip = new JSZip();
      const usedNames = {};
      selected.forEach(i => {
        const chat = chats[i];
        let safeTitle = chat.title.replace(/[\\/:*?"<>|]/g, '').slice(0, 40) || "Untitled";
        let finalName = safeTitle;
        let counter = 1;
        while (usedNames[finalName]) {
          counter += 1;
          finalName = `${safeTitle}_${counter}`;
        }
        usedNames[finalName] = true;
        const text = `${chat.title}\n\n${chat.messages.join('\n\n')}`;
        zip.file(`${finalName}.txt`, text);
      });

      const now = new Date();
      const formatted = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear().toString().slice(-2)} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${formatted}.zip`;
      link.click();
    };

    // Drag
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
}

// Load locally using Chrome Extension API
window.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) {
      app.textContent = 'No active tab found.';
      return;
    }
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, files: ["jszip.min.js"] },
      () => {
        if (chrome.runtime.lastError) {
          app.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }
        chrome.scripting.executeScript(
          { target: { tabId: tab.id }, func: injectChatExporter },
          () => {
            if (chrome.runtime.lastError) {
              app.textContent = 'Error: ' + chrome.runtime.lastError.message;
            } else {
              window.close();
            }
          }
        );
      }
    );
  });
});
