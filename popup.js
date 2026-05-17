document.addEventListener('DOMContentLoaded', async () => {
    const scanBtn = document.getElementById('scanBtn');
    const statusMsg = document.getElementById('status-msg');
    const priceList = document.getElementById('priceList');

    // Verificăm dacă elementele există în HTML pentru a evita erorile
    if (!scanBtn || !statusMsg || !priceList) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;

    const domain = new URL(tab.url).hostname;
    const storageKey = `prices_${domain}`;

    const loadPrices = () => {
        chrome.storage.local.get([storageKey], (result) => {
            priceList.innerHTML = ''; 

            if (result[storageKey] && result[storageKey].length > 0) {
                result[storageKey].forEach(item => {
                    const li = document.createElement('li');
                    li.style.padding = "5px 0";
                    li.style.fontSize = "0.85em";
                    li.style.borderBottom = "1px solid #eee";
                    li.innerHTML = `<span>${item.price} Lei</span> <small style="color:gray; float:right;">${new Date(item.timestamp).toLocaleTimeString('ro-RO')}</small>`;
                    priceList.appendChild(li);
                });
            } else {
                priceList.innerHTML = '<li style="color:gray; font-size:0.8em;">Nicio scanare recentă.</li>';
            }
        });
    };

    // Încărcăm datele salvate anterior la deschiderea popup-ului
    loadPrices();

    // Logica butonului
    scanBtn.addEventListener('click', () => {
        // Resetăm mesajul și oferim feedback vizual
        statusMsg.textContent = "Scanare în curs...";
        statusMsg.style.color = "#007bff";

        chrome.tabs.sendMessage(tab.id, { action: "manual_scan" }, (response) => {
            if (chrome.runtime.lastError) {
                statusMsg.textContent = "Eroare: Refresh la pagină!";
                statusMsg.style.color = "#dc3545";
                console.error(chrome.runtime.lastError.message);
                return;
            }

            // Simulăm un mic delay pentru procesare (UX mai bun)
            setTimeout(() => {
                statusMsg.textContent = "Datele sunt la zi.";
                statusMsg.style.color = "#28a745";
                loadPrices(); 
            }, 800);
        });
    });
});