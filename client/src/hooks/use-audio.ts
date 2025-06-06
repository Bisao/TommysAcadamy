import { useState, useCallback } from "react";

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [remainingText, setRemainingText] = useState("");
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const playText = useCallback((text: string, lang: string = "pt-BR", fromPosition: number = 0, onWordBoundary?: (word: string, index: number) => void) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    // Stop any currently playing speech
    speechSynthesis.cancel();

    // Split text into words to track position
    const words = text.split(' ');
    const textToPlay = words.slice(fromPosition).join(' ');
    
    setCurrentText(text);
    setRemainingText(textToPlay);

    const utterance = new SpeechSynthesisUtterance(textToPlay);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 0.9; // Slightly lower pitch for male voice
    utterance.volume = 1;
    
    setCurrentUtterance(utterance);

    // Try to select a Brazilian Portuguese voice
    const voices = speechSynthesis.getVoices();
    
    // First try to find a Brazilian Portuguese voice
    const brazilianVoice = voices.find(voice => 
      voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR')
    );

    // Fallback to any Portuguese voice
    const portugueseVoice = voices.find(voice => 
      voice.lang.includes('pt')
    );

    // Always prioritize American English male voice for Professor Tommy
    const americanMaleVoice = voices.find(voice => 
      voice.lang.includes('en-US') && 
      (voice.name.toLowerCase().includes('male') || 
       voice.name.toLowerCase().includes('david') ||
       voice.name.toLowerCase().includes('mark') ||
       voice.name.toLowerCase().includes('alex') ||
       voice.name.toLowerCase().includes('daniel') ||
       voice.name.toLowerCase().includes('fred') ||
       voice.name.toLowerCase().includes('paul') ||
       voice.name.toLowerCase().includes('jorge'))
    );
    
    const americanVoice = voices.find(voice => voice.lang.includes('en-US'));
    
    // Professor Tommy always uses American English voice
    if (americanMaleVoice) {
      utterance.voice = americanMaleVoice;
      utterance.lang = "en-US";
    } else if (americanVoice) {
      utterance.voice = americanVoice;
      utterance.lang = "en-US";
    }
    
    // If no English voice available, fallback to Portuguese
    if (!utterance.voice) {
      if (brazilianVoice) {
        utterance.voice = brazilianVoice;
      } else if (portugueseVoice) {
        utterance.voice = portugueseVoice;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    // Add word boundary event for synchronization with mobile fallback
    if (onWordBoundary) {
      let wordTimer: NodeJS.Timeout | null = null;
      let currentWordIndex = 0;
      const words = textToPlay.split(' ');
      const averageWordDuration = Math.max(400, (1 / (utterance.rate || 0.8)) * 400); // Estimated milliseconds per word
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        // Trigger first word immediately
        onWordBoundary('', 0);
        currentWordIndex = 0;
        
        // Fallback timer for mobile devices that don't support word boundary events
        const startWordTimer = () => {
          wordTimer = setInterval(() => {
            if (currentWordIndex < words.length) {
              onWordBoundary(words[currentWordIndex] || '', currentWordIndex);
              currentWordIndex++;
            } else {
              if (wordTimer) clearInterval(wordTimer);
            }
          }, averageWordDuration);
        };
        
        // Detect mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        
        // Start fallback timer immediately on mobile, or after a delay on desktop
        if (isMobile) {
          startWordTimer();
        } else {
          setTimeout(() => {
            if (currentWordIndex === 0) {
              startWordTimer();
            }
          }, averageWordDuration / 2);
        }
      };
      
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          // Clear fallback timer if boundary events are working
          if (wordTimer) {
            clearInterval(wordTimer);
            wordTimer = null;
          }
          
          const words = textToPlay.split(' ');
          const charIndex = event.charIndex;
          let wordIndex = 0;
          let charCount = 0;
          
          for (let i = 0; i < words.length; i++) {
            if (charCount + words[i].length >= charIndex) {
              wordIndex = i + fromPosition;
              break;
            }
            charCount += words[i].length + 1; // +1 for space
          }
          
          currentWordIndex = wordIndex - fromPosition + 1;
          onWordBoundary(words[wordIndex - fromPosition] || '', wordIndex);
        }
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        if (wordTimer) {
          clearInterval(wordTimer);
          wordTimer = null;
        }
      };
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        if (wordTimer) {
          clearInterval(wordTimer);
          wordTimer = null;
        }
      };
    } else {
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
    }

    // Wait for voices to load if not available yet
    if (voices.length === 0) {
      speechSynthesis.addEventListener('voiceschanged', () => {
        const updatedVoices = speechSynthesis.getVoices();
        
        const updatedBrazilianVoice = updatedVoices.find(voice => 
          voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR')
        );
        
        const updatedPortugueseVoice = updatedVoices.find(voice => 
          voice.lang.includes('pt')
        );
        
        // Always prioritize American English male voice for Professor Tommy
        const updatedAmericanMaleVoice = updatedVoices.find(voice => 
          voice.lang.includes('en-US') && 
          (voice.name.toLowerCase().includes('male') || 
           voice.name.toLowerCase().includes('david') ||
           voice.name.toLowerCase().includes('mark') ||
           voice.name.toLowerCase().includes('alex') ||
           voice.name.toLowerCase().includes('daniel') ||
           voice.name.toLowerCase().includes('fred') ||
           voice.name.toLowerCase().includes('paul') ||
           voice.name.toLowerCase().includes('jorge'))
        );
        
        const updatedAmericanVoice = updatedVoices.find(voice => voice.lang.includes('en-US'));
        
        if (updatedAmericanMaleVoice) {
          utterance.voice = updatedAmericanMaleVoice;
          utterance.lang = "en-US";
        } else if (updatedAmericanVoice) {
          utterance.voice = updatedAmericanVoice;
          utterance.lang = "en-US";
        } else {
          // Fallback to Portuguese only if no English voice available
          if (updatedBrazilianVoice) {
            utterance.voice = updatedBrazilianVoice;
          } else if (updatedPortugueseVoice) {
            utterance.voice = updatedPortugueseVoice;
          }
        }
        
        speechSynthesis.speak(utterance);
      }, { once: true });
    } else {
      speechSynthesis.speak(utterance);
    }
  }, []);

  const pauseAudio = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  const resumeAudio = useCallback(() => {
    if (speechSynthesis.paused && currentUtterance) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, [currentUtterance]);

  const stopAudio = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
    setCurrentText("");
    setRemainingText("");
  }, []);

  return { 
    playText, 
    pauseAudio, 
    resumeAudio, 
    stopAudio, 
    isPlaying, 
    isPaused,
    currentText,
    remainingText 
  };
}
