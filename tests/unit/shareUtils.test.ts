import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildCGPAShareText,
  shareWhatsApp,
  shareTelegram,
  shareTwitter,
  shareLinkedIn,
  shareNative,
  copyToClipboard,
} from '../../src/lib/shareUtils';

describe('shareUtils Unit Tests', () => {
  const originalWindowOpen = window.open;
  let openedUrl = '';
  let openedTarget = '';
  let openedFeatures = '';

  beforeEach(() => {
    openedUrl = '';
    openedTarget = '';
    openedFeatures = '';
    window.open = vi.fn().mockImplementation((url, target, features) => {
      openedUrl = String(url);
      openedTarget = String(target);
      openedFeatures = String(features);
      return null;
    });
  });

  afterEach(() => {
    window.open = originalWindowOpen;
    vi.restoreAllMocks();
  });

  describe('buildCGPAShareText', () => {
    it('should build formatted share text with student name', () => {
      const payload = buildCGPAShareText('3.85', 'Asad Khan');
      expect(payload.title).toBe('My UBIT CGPA Result 🎓');
      expect(payload.text).toContain('Asad Khan scored a CGPA of 3.85 at UBIT BSCS!');
      expect(payload.url).toBe('https://ubit-results-28.vercel.app');
      expect(payload.hashtags).toContain('UBIT');
    });

    it('should build formatted share text without name as first person', () => {
      const payload = buildCGPAShareText('3.92');
      expect(payload.text).toContain('I got a CGPA of 3.92 at UBIT BSCS! 🎉');
      expect(payload.url).toBe('https://ubit-results-28.vercel.app');
    });
  });

  describe('Social Share URL Launchers', () => {
    it('shareWhatsApp should construct valid WhatsApp link with encoded text', () => {
      shareWhatsApp({ title: 'Check this out', text: 'My CGPA is 3.8', url: 'https://ubit-results-28.vercel.app' });
      expect(window.open).toHaveBeenCalledTimes(1);
      expect(openedUrl).toContain('https://wa.me/?text=');
      expect(openedUrl).toContain(encodeURIComponent('My CGPA is 3.8'));
      expect(openedTarget).toBe('_blank');
      expect(openedFeatures).toContain('noopener');
    });

    it('shareTelegram should construct valid Telegram share link', () => {
      shareTelegram({ title: 'UBIT Portal', url: 'https://ubit-results-28.vercel.app' });
      expect(window.open).toHaveBeenCalledTimes(1);
      expect(openedUrl).toContain('https://t.me/share/url?url=');
      expect(openedUrl).toContain(encodeURIComponent('https://ubit-results-28.vercel.app'));
    });

    it('shareTwitter should construct valid X/Twitter tweet intent', () => {
      shareTwitter({ text: 'Got 3.95 CGPA!', hashtags: ['UBIT', 'Karachi'] });
      expect(window.open).toHaveBeenCalledTimes(1);
      expect(openedUrl).toContain('https://x.com/intent/tweet?text=');
      expect(openedUrl).toContain('hashtags=UBIT,Karachi');
    });

    it('shareLinkedIn should construct valid LinkedIn sharing URL', () => {
      shareLinkedIn({ url: 'https://ubit-results-28.vercel.app' });
      expect(window.open).toHaveBeenCalledTimes(1);
      expect(openedUrl).toContain('https://www.linkedin.com/sharing/share-offsite/?url=');
    });
  });

  describe('shareNative', () => {
    it('should call navigator.share when supported and return true', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      const canShareMock = vi.fn().mockReturnValue(true);

      Object.defineProperty(navigator, 'share', { value: shareMock, configurable: true });
      Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true });

      const result = await shareNative({ title: 'Test', text: 'Score' });
      expect(result).toBe(true);
      expect(shareMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test',
          text: 'Score',
          url: 'https://ubit-results-28.vercel.app',
        })
      );
    });

    it('should return false if user cancels (AbortError)', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      const shareMock = vi.fn().mockRejectedValue(abortError);
      const canShareMock = vi.fn().mockReturnValue(true);

      Object.defineProperty(navigator, 'share', { value: shareMock, configurable: true });
      Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true });

      const result = await shareNative({ title: 'Test' });
      expect(result).toBe(false);
    });

    it('should return false when navigator.share is unavailable', async () => {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
      const result = await shareNative();
      expect(result).toBe(false);
    });
  });

  describe('copyToClipboard', () => {
    it('should write to navigator.clipboard in secure contexts', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        configurable: true,
      });

      const success = await copyToClipboard('https://ubit-results-28.vercel.app');
      expect(success).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith('https://ubit-results-28.vercel.app');
    });

    it('should fall back to document.execCommand when clipboard API is missing', async () => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
      document.execCommand = vi.fn().mockReturnValue(true);

      const success = await copyToClipboard('https://test-copy.com');
      expect(success).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
  });
});
