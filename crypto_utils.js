// Funcție internă pentru gestionarea cheii
async function getOrCreateKey() {
    const data = await chrome.storage.local.get(['session_key']);
    if (data.session_key) {
        return await crypto.subtle.importKey("jwk", data.session_key, "AES-GCM", true, ["encrypt", "decrypt"]);
    } else {
        const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
        const exportedKey = await crypto.subtle.exportKey("jwk", key);
        await chrome.storage.local.set({ session_key: exportedKey });
        return key;
    }
}

// Aceasta funcție primește acum direct textul "cap-coadă" și îl criptează
export async function encryptLog(text) {
    const key = await getOrCreateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoded
    );

    return {
        iv: btoa(String.fromCharCode(...iv)),
        payload: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
        timestamp: new Date().toISOString() // Ora la care a fost criptat
    };
}