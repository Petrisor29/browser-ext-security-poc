document.getElementById('scanBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Trimitem mesaj către content.js
    chrome.tabs.sendMessage(tab.id, { action: "get_prices" }, (response) => {
        if (response && response.prices) {
            saveToStorage(new URL(tab.url).hostname, response.prices);
            displayPrices(response.prices);
        }
    });
});

function saveToStorage(domain, prices) {
    const data = {
        timestamp: new Date().toLocaleString(),
        prices: prices
    };

    chrome.storage.local.get([domain], (result) => {
        let history = result[domain] || [];
        history.push(data);
        chrome.storage.local.set({ [domain]: history });
    });
    
    function displayPrices(prices) {
    const list = document.getElementById('priceList');
    const status = document.getElementById('status');
    
    if (prices.length === 0) {
        status.innerText = "Nu am găsit prețuri pe această pagină.";
        return;
    }

    status.innerText = `Am găsit ${prices.length} prețuri.`;
    
    // Creăm un card pentru scanarea curentă
    const entryDiv = document.createElement('div');
    entryDiv.className = 'price-entry';
    
    const time = new Date().toLocaleTimeString();
    entryDiv.innerHTML = `
        <small>Scanat la: ${time}</small>
        <strong>${prices.join(' | ')}</strong>
    `;
    
    list.prepend(entryDiv); // Punem cele mai noi prețuri sus
}
}