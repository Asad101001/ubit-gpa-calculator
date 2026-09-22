/**
 * shareUtils.ts
 * Unified social sharing + Web Share API utility for UBIT GPA Calculator.
 * Handles: WhatsApp, Telegram, Twitter/X, native Web Share, clipboard copy.
 */

const SITE_URL = 'https://ubit-results-28.vercel.app';
const DEFAULT_TITLE = 'UBIT GPA Calculator & Results Portal';
const DEFAULT_DESC = 'Free GPA/CGPA calculator + live class results for UBIT BSCS Batch 2024–28, University of Karachi.';

export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
  hashtags?: string[];
}

/**
 * Use the native Web Share API if available (mobile-first).
 * Falls back to WhatsApp share on desktop.
 */
export const shareNative = async (payload: SharePayload = {}): Promise<boolean> => {
  const shareData: ShareData = {
    title: payload.title ?? DEFAULT_TITLE,
    text: payload.text ?? DEFAULT_DESC,
    url: payload.url ?? SITE_URL,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (e: any) {
      // User cancelled — not an error
      if (e.name === 'AbortError') return false;
      console.warn('Web Share failed, falling back:', e);
    }
  }
  return false;
};

/** Share to WhatsApp */
export const shareWhatsApp = (payload: SharePayload = {}) => {
  const text = encodeURIComponent(
    `${payload.title ?? DEFAULT_TITLE}\n${payload.text ?? DEFAULT_DESC}\n${payload.url ?? SITE_URL}`
  );
  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
};

/** Share to Telegram */
export const shareTelegram = (payload: SharePayload = {}) => {
  const url = encodeURIComponent(payload.url ?? SITE_URL);
  const text = encodeURIComponent(payload.title ?? DEFAULT_TITLE);
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
};

/** Share to Twitter/X */
export const shareTwitter = (payload: SharePayload = {}) => {
  const text = encodeURIComponent(payload.text ?? DEFAULT_TITLE);
  const url = encodeURIComponent(payload.url ?? SITE_URL);
  const hashtags = (payload.hashtags ?? ['UBIT', 'BSCS', 'UniversityOfKarachi']).join(',');
  window.open(
    `https://x.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`,
    '_blank',
    'noopener,noreferrer,width=600,height=400'
  );
};

/** Share to LinkedIn */
export const shareLinkedIn = (payload: SharePayload = {}) => {
  const url = encodeURIComponent(payload.url ?? SITE_URL);
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    '_blank',
    'noopener,noreferrer,width=600,height=500'
  );
};

/** Copy URL to clipboard */
export const copyToClipboard = async (text?: string): Promise<boolean> => {
  const content = text ?? SITE_URL;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
      return true;
    } else {
      // Fallback for older browsers / non-https
      const el = document.createElement('textarea');
      el.value = content;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      const success = document.execCommand('copy');
      document.body.removeChild(el);
      return success;
    }
  } catch (e) {
    console.error('Clipboard copy failed:', e);
    return false;
  }
};

/**
 * Build a pre-filled share text for a student's CGPA result.
 * e.g. "I scored a CGPA of 3.87 on UBIT Results! 🎓 Check yours at..."
 */
export const buildCGPAShareText = (cgpa: string, name?: string): SharePayload => ({
  title: 'My UBIT CGPA Result 🎓',
  text: name
    ? `${name} scored a CGPA of ${cgpa} at UBIT BSCS! Calculate yours:`
    : `I got a CGPA of ${cgpa} at UBIT BSCS! 🎉 Check yours:`,
  url: SITE_URL,
  hashtags: ['UBIT', 'BSCS2028', 'UniversityOfKarachi', 'GPA'],
});
