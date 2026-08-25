/**
 * Browser Notification and Speech Synthesis service
 */

export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return 'denied';
  }
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function triggerBrowserNotification(title: string, body: string, iconUrl?: string): boolean {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: iconUrl || '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'medimate-reminder',
        requireInteraction: true
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
      return true;
    } catch (e) {
      console.warn('Notification trigger error:', e);
      return false;
    }
  }
  return false;
}

export function playVoiceReminder(
  medicineName: string,
  dosage: string,
  foodInstruction: string
): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser.');
    return;
  }

  try {
    // Cancel any previous utterance
    window.speechSynthesis.cancel();

    let text = `It's medicine time. Please take ${medicineName}, ${dosage}`;
    if (foodInstruction && foodInstruction !== 'No instruction') {
      text += `, ${foodInstruction.toLowerCase()}`;
    }
    text += '.';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower pace for elderly clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.default));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn('Voice reminder error:', error);
  }
}

export function stopVoiceReminder(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
