// ============================================
// TrustLink — Push Notifications (Web Push API)
// Requires HTTPS + Service Worker
// ============================================

const PushNotifications = {
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  async requestPermission() {
    if (!this.isSupported()) {
      Toast.warning('Push notifications are not supported on this device');
      return 'denied';
    }
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') {
      Toast.warning('Notifications blocked. Enable them in your browser settings.');
      return 'denied';
    }
    const result = await Notification.requestPermission();
    return result;
  },

  async subscribe() {
    if (!this.isSupported()) return null;
    const permission = await this.requestPermission();
    if (permission !== 'granted') return null;

    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // VAPID public key placeholder — replace with real key from backend
          'BEl62iUYgUivxVkvSD9OaHslKmGQtWYk5pVoFmExSydMoMaZ2TtMJE6c3xGdPCXqR7gKJn5gQDGBJbN5qJd1HQ'
        )
      });
      return subscription;
    } catch (err) {
      console.error('Push subscription failed:', err);
      return null;
    }
  },

  async unsubscribe() {
    if (!this.isSupported()) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
    } catch (err) {
      console.error('Push unsubscribe failed:', err);
    }
  },

  // Send subscription to backend (placeholder — implement when backend exists)
  async saveSubscription(subscription) {
    // TODO: POST subscription to your backend endpoint
    // await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
    console.log('[Push] Subscription saved locally:', subscription.endpoint.slice(0, 50) + '...');
    localStorage.setItem('trustlink_push_subscription', JSON.stringify(subscription));
  },

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
};
