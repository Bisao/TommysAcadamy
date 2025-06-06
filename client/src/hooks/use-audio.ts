import { useState, useCallback } from "react";

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);

  const playText = useCallback((text: string, lang: string = "pt-BR") => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    // Stop any currently playing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
    };

    speechSynthesis.speak(utterance);
  }, []);

  const stopAudio = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  return { playText, stopAudio, isPlaying };
}
