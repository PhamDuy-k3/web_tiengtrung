/**
 * Web Speech API wrapper for standard zh-CN Chinese speech synthesis.
 * Supports standard speech and slow speech (turtle mode).
 */

class SpeechService {
  private hasSupport: boolean = false;
  private zhVoice: SpeechSynthesisVoice | null = null;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.hasSupport = true;
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize zh-CN, zh-HK, zh-TW, or general zh voices
    this.zhVoice =
      voices.find((v) => v.lang.toLowerCase() === "zh-cn" || v.lang.toLowerCase() === "zh_cn") ||
      voices.find((v) => v.lang.toLowerCase().startsWith("zh")) ||
      null;
    this.initialized = true;
  }

  public isAvailable(): boolean {
    return this.hasSupport;
  }

  public hasChineseVoice(): boolean {
    if (!this.initialized) this.initVoices();
    return !!this.zhVoice;
  }

  public speak(text: string, rate: number = 0.9): Promise<void> {
    return new Promise((resolve) => {
      if (!this.hasSupport || typeof window === "undefined") {
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Stop any pending utterance

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = rate; // 0.9 for normal, 0.6 for slow
      utterance.pitch = 1.0;

      if (!this.zhVoice) {
        this.initVoices();
      }
      if (this.zhVoice) {
        utterance.voice = this.zhVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  public stop(): void {
    if (this.hasSupport && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
