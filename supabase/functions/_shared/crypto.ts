import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";
import { encodeBase64, decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const MASTER_KEY_HEX = Deno.env.get("PAYMENT_ENCRYPTION_KEY") || "";

async function getMasterKey() {
    if (!MASTER_KEY_HEX || MASTER_KEY_HEX.length !== 64) {
        throw new Error("Invalid PAYMENT_ENCRYPTION_KEY. Must be 32 bytes hex.");
    }

    // Convert hex to bytes
    const keyBytes = new Uint8Array(
        MASTER_KEY_HEX.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    return await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encrypt(text: string): Promise<string> {
    const key = await getMasterKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoded
    );

    // Return IV + Encrypted Data as Base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return encodeBase64(combined);
}

export async function decrypt(encryptedBase64: string): Promise<string> {
    const key = await getMasterKey();
    const data = decodeBase64(encryptedBase64);

    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted
    );

    return new TextDecoder().decode(decrypted);
}
