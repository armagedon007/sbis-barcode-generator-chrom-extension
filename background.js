// Background service worker для расширения

chrome.runtime.onInstalled.addListener(() => {
  console.log('СБИС Barcode Generator установлен');
});

// Обработка сообщений от content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkBarcode') {
    // Здесь можно добавить логику проверки через API
    // Пока возвращаем заглушку
    sendResponse({ unique: true });
  }
  
  return true;
});
