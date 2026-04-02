"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";

function supportsPush() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function subscribe() {
  return () => {};
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function getPushSubscription(): Promise<PushSubscription | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export function useNotifications() {
  const supported = useSyncExternalStore(subscribe, supportsPush, () => false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!supported) return;
    void getPushSubscription().then((sub) => setSubscribed(!!sub));
  }, [supported]);

  const subscribePush = useCallback(async () => {
    const key = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
    if (!supported || !key) return false;
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return false;

    const reg = await navigator.serviceWorker.register("/sw.js");
    await reg.update();

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });

    const json = sub.toJSON();
    const r = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json),
    });
    if (!r.ok) return false;
    setSubscribed(true);
    return true;
  }, [supported]);

  const unsubscribePush = useCallback(async () => {
    if (!supported) return false;
    const sub = await getPushSubscription();
    if (!sub) {
      setSubscribed(false);
      return true;
    }
    const endpoint = sub.endpoint;
    const r = await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint }),
    });
    if (!r.ok) return false;
    await sub.unsubscribe();
    setSubscribed(false);
    return true;
  }, [supported]);

  return {
    supported,
    subscribed,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  };
}
