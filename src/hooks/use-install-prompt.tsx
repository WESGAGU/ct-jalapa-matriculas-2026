'use client';
import { useState, useEffect } from "react";

// Extend the Window interface to include our custom event type
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }
  
declare global {
    interface WindowEventMap {
      'beforeinstallprompt': BeforeInstallPromptEvent;
    }
}


export function useInstallPrompt(): [BeforeInstallPromptEvent | null, () => Promise<void>] {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
          e.preventDefault();
          setDeferredPrompt(e);
        };
    
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
        return () => {
          window.removeEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt
          );
        };
      }, []);

      const handleInstallClick = async () => {
        if (!deferredPrompt) {
          return;
        }
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
      };
    
    return [deferredPrompt, handleInstallClick];
}