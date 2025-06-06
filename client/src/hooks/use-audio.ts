import { useState, useCallback } from "react";

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);

  const playText = useCallback((text: string, lang: string = "en-US") => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported");
      return Promise.reject(new Error("Speech synthesis not supported"));
    }

    return new Promise<void>((resolve, reject) => {
      // Stop any currently playing speech
      speechSynthesis.cancel();

      // Wait a bit for cancel to take effect
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsPlaying(true);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          resolve();
        };

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          setIsPlaying(false);
          reject(event);
        };

        // Ensure voices are loaded
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
          speechSynthesis.addEventListener('voiceschanged', () => {
            speechSynthesis.speak(utterance);
          }, { once: true });
        } else {
          speechSynthesis.speak(utterance);
        }
      }, 100);
    });
  }, []);

  const stopAudio = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  return { playText, stopAudio, isPlaying };
}
