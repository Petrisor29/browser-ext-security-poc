// Funcția principală de scanare
function extractPrices() {
    // Regex-ul explicat anterior: prinde numere urmate de lei/ron
    const priceRegex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:ron|lei)/gi;
    const bodyText = document.body.innerText;
    const matches = bodyText.match(priceRegex) || [];
    
    // Curățăm duplicatele
    return [...new Set(matches)];
}

// Ascultăm mesajul de la Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get_prices") {
        const prices = extractPrices();
        sendResponse({ prices: prices });
    }
});