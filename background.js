// Background service worker для расширения

console.log('[SBIS Barcode] Background service worker запущен');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[SBIS Barcode] Расширение установлено/обновлено:', details.reason);
  
  // Показываем уведомление при установке
  if (details.reason === 'install') {
    console.log('[SBIS Barcode] Первая установка расширения');
  } else if (details.reason === 'update') {
    console.log('[SBIS Barcode] Обновление расширения до версии:', chrome.runtime.getManifest().version);
  }
});

// Обработка сообщений от content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[SBIS Barcode] Получено сообщение:', request);
  
  if (request.action === 'checkBarcode') {
    // Здесь можно добавить логику проверки через API
    // Пока возвращаем заглушку
    sendResponse({ unique: true });
  }
  
  return true;
});

// Проверка что service worker работает
console.log('[SBIS Barcode] Service worker активен, версия:', chrome.runtime.getManifest().version);
