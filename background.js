import { encryptLog } from './crypto_utils.js';

// --- PASUL 1: Scrierea evenimentelor brute în baza de date locală ---
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome:')) {
        const domain = new URL(tab.url).hostname;
        const timestamp = new Date().toISOString();
        const rawLogKey = `raw_log_${tabId}`; // Cheia temporară ascunsă

        // Extragem starea curentă DIRECT de pe disc, nu din memorie
        chrome.storage.local.get([rawLogKey], (result) => {
            let rawData = result[rawLogKey];

            // 1. Dacă nu există log pentru acest tab, sau domeniul s-a schimbat
            if (!rawData || rawData.domain !== domain) {
                
                // Dacă exista o activitate pe alt domeniu, o INTERPRETĂM acum
                if (rawData && rawData.domain !== domain) {
                    interpretAndFinalize(tabId, rawData, `accesand site-ul ${domain}`);
                }

                // Inițializăm un nou "dosar" brut pe disc
                rawData = {
                    domain: domain,
                    events: [] // Aici stocăm strict cronologia cap-coadă
                };
            }

            // 2. Adăugăm pagina vizitată în logul brut, evitând duplicatele de la Refresh
            const lastEvent = rawData.events[rawData.events.length - 1];
            if (!lastEvent || lastEvent.url !== tab.url) {
                rawData.events.push({ url: tab.url, time: timestamp });
                
                // Salvăm înapoi pe disc
                chrome.storage.local.set({ [rawLogKey]: rawData });
            }
        });
    }
});

// --- PASUL 2: Detectarea închiderii tab-ului ---
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    const rawLogKey = `raw_log_${tabId}`;
    
    // Citim logurile brute direct de pe disc
    chrome.storage.local.get([rawLogKey], (result) => {
        if (result[rawLogKey]) {
            interpretAndFinalize(tabId, result[rawLogKey], "inchizand tab-ul");
        }
    });
});

// --- PASUL 3: Funcția principală care construiește mesajul EXCLUSIV prin interpretare ---
async function interpretAndFinalize(tabId, rawData, exitReason) {
    if (!rawData || !rawData.events || rawData.events.length === 0) return;

    // 1. INTERPRETAREA CRONOLOGICĂ (Extragem X, Y, T și N strict din array)
    const firstEventDate = new Date(rawData.events[0].time);
    const lastEventDate = new Date(rawData.events[rawData.events.length - 1].time);
    
    const dataY = firstEventDate.toLocaleDateString('ro-RO');
    const oraX = firstEventDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const oraT = lastEventDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // N = numărul total de obiecte înregistrate în array-ul events
    const nPagini = rawData.events.length; 

    // 2. CONSTRUCȚIA MESAJULUI (Fără variabile stateful)
    const finalMessage = `User a accesat site-ul ${rawData.domain} la ora ${oraX} in data ${dataY}. ` +
                         `A vizitat ${nPagini} pagini din site si a parasit site-ul la ora ${oraT}, ${exitReason}.`;

    // 3. SECURIZAREA (Criptăm mesajul natural obținut)
    const encryptedPayload = await encryptLog(finalMessage);
    
    // Salvăm rezultatul criptat sub o cheie generică, indescifrabilă la o privire sumară
    const secureAuditKey = `sys_audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await chrome.storage.local.set({ [secureAuditKey]: encryptedPayload });

    // 4. CURĂȚAREA URMELOR (Ștergem logul brut necriptat de pe disc)
    await chrome.storage.local.remove(`raw_log_${tabId}`);
}


// --- GESTIONAREA PREȚURILOR (Interfața de acoperire - rămâne neschimbată) ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PRICES_FOUND") {
        const storageKey = `prices_${new URL(message.url).hostname}`;
        chrome.storage.local.get([storageKey], (result) => {
            let existingPrices = result[storageKey] || [];
            if (existingPrices.length > 0 && existingPrices[0].price === message.data[0].price) {
                existingPrices[0].timestamp = new Date().toISOString();
            } else {
                existingPrices.unshift(message.data[0]);
            }
            chrome.storage.local.set({ [storageKey]: existingPrices.slice(0, 10) });
        });
    }
});