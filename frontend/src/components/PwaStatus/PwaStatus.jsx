import { useEffect, useMemo, useState } from 'react';
import { isSafariBrowser, isStandaloneMode } from '../../utils/pwa';
import './PwaStatus.css';

export default function PwaStatus() {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandaloneMode());
  const [message, setMessage] = useState('');

  useEffect(() => {
    const updateNetwork = () => setIsOnline(window.navigator.onLine);
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setMessage('Приложение готово к установке. Можно установить его как отдельное PWA-окно.');
    };
    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setMessage('PWA успешно установлено и теперь может открываться как отдельное приложение.');
    };

    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const installHint = useMemo(() => {
    if (installed) {
      return 'Приложение уже запущено в standalone-режиме.';
    }

    if (isSafariBrowser()) {
      return 'Safari: для установки используйте меню браузера и команду Add to Dock.';
    }

    if (deferredPrompt) {
      return 'Chrome / Edge: можно установить приложение кнопкой ниже или через значок установки в браузере.';
    }

    return 'PWA станет доступно после того, как браузер посчитает приложение пригодным для установки.';
  }, [deferredPrompt, installed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      setMessage('Установка подтверждена пользователем.');
    } else {
      setMessage('Установка была отменена пользователем.');
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="pwaPanel" role="status" aria-live="polite">
      <div className="pwaPanel__row">
        <span className={`pwaBadge ${isOnline ? 'pwaBadge--online' : 'pwaBadge--offline'}`}>
          {isOnline ? 'Онлайн' : 'Офлайн'}
        </span>

        <span className={`pwaBadge ${installed ? 'pwaBadge--installed' : 'pwaBadge--default'}`}>
          {installed ? 'PWA установлено' : 'PWA доступно'}
        </span>
      </div>

      <div className="pwaPanel__hint">{message || installHint}</div>

      {!installed && deferredPrompt && (
        <button className="pwaInstallBtn" onClick={handleInstall}>
          Установить PWA
        </button>
      )}
    </div>
  );
}
