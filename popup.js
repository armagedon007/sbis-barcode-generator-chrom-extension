// Загрузка настроек
function loadSettings() {
  chrome.storage.sync.get({ prefix: '62', startNumber: 100000, lastNumber: 0, debugMode: false }, (items) => {
    document.getElementById('prefix').value = items.prefix;
    document.getElementById('startNumber').value = items.startNumber;
    document.getElementById('debugMode').checked = items.debugMode;
  });
}

// Сохранение настроек
function saveSettings() {
  const prefix = document.getElementById('prefix').value.trim();
  const startNumber = parseInt(document.getElementById('startNumber').value) || 100000;
  const debugMode = document.getElementById('debugMode').checked;
  
  // Валидация префикса
  if (!/^\d+$/.test(prefix)) {
    showStatus('Префикс должен содержать только цифры', 'error');
    return;
  }
  
  if (prefix.length === 0 || prefix.length > 5) {
    showStatus('Префикс должен быть от 1 до 5 цифр', 'error');
    return;
  }
  
  // Валидация начального номера
  if (startNumber < 1) {
    showStatus('Начальный номер должен быть больше 0', 'error');
    return;
  }
  
  chrome.storage.sync.set({ prefix, startNumber, debugMode }, () => {
    showStatus('✓ Настройки сохранены', 'success');
    
    // Уведомляем все вкладки СБИС об изменении режима отладки
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && (tab.url.includes('sbis.ru') || tab.url.includes('saby.ru'))) {
          chrome.tabs.sendMessage(tab.id, { action: 'updateDebugMode', debugMode }).catch(() => {
            // Игнорируем ошибки для вкладок где content script не загружен
          });
        }
      });
    });
  });
}

// Сброс настроек
function resetSettings() {
  chrome.storage.sync.set({ prefix: '62', startNumber: 100000, lastNumber: 0, debugMode: false }, () => {
    loadSettings();
    showStatus('✓ Настройки сброшены', 'success');
  });
}

// Показ статуса
function showStatus(message, type) {
  const status = document.getElementById('save-status');
  status.textContent = message;
  status.className = 'save-status ' + type;
  
  setTimeout(() => {
    status.className = 'save-status';
  }, 3000);
}

// Проверка обновлений
async function handleCheckUpdates() {
  const button = document.getElementById('checkUpdates');
  const info = document.getElementById('updateInfo');
  
  button.disabled = true;
  button.textContent = 'Проверка...';
  info.textContent = '';
  
  try {
    const currentVersion = chrome.runtime.getManifest().version;
    
    // Получаем manifest.json из GitHub
    const manifestUrl = 'https://raw.githubusercontent.com/armagedon007/sbis-barcode-generator-chrom-extension/main/manifest.json';
    const response = await fetch(manifestUrl);
    
    if (!response.ok) {
      throw new Error('Не удалось получить информацию об обновлении');
    }
    
    const remoteManifest = await response.json();
    const remoteVersion = remoteManifest.version;
    
    // Сравниваем версии
    const isNewer = compareVersions(remoteVersion, currentVersion) > 0;
    
    if (isNewer) {
      info.textContent = `Доступна новая версия ${remoteVersion} (текущая: ${currentVersion})`;
      info.style.color = '#2e7d32';
      
      // Предлагаем загрузить обновление
      button.textContent = 'Загрузить обновление';
      button.disabled = false;
      button.onclick = handleDownloadUpdate;
    } else {
      info.textContent = `У вас установлена последняя версия ${currentVersion}`;
      info.style.color = '#666';
      button.textContent = 'Проверить обновления';
      button.disabled = false;
    }
  } catch (error) {
    console.error('Ошибка проверки обновлений:', error);
    info.textContent = 'Ошибка: ' + error.message;
    info.style.color = '#c62828';
    button.textContent = 'Проверить обновления';
    button.disabled = false;
  }
}

// Сравнение версий (1.0.1 > 1.0.0)
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

// Загрузка обновления
async function handleDownloadUpdate() {
  const button = document.getElementById('checkUpdates');
  const info = document.getElementById('updateInfo');
  
  button.disabled = true;
  button.textContent = 'Загрузка...';
  
  try {
    const files = ['manifest.json', 'content.js', 'background.js', 'popup.html', 'popup.js'];
    const updates = {};
    
    for (const file of files) {
      const fileUrl = `https://raw.githubusercontent.com/armagedon007/sbis-barcode-generator-chrom-extension/main/${file}`;
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Не удалось загрузить файл: ${file}`);
      }
      
      const content = await response.text();
      updates[file] = content;
    }
    
    // Сохраняем обновления в storage
    await chrome.storage.local.set({ pendingUpdates: updates });
    
    info.textContent = 'Обновления загружены. Перезагрузите расширение в browser://extensions/';
    info.style.color = '#2e7d32';
    button.textContent = 'Обновление загружено';
    
  } catch (error) {
    console.error('Ошибка загрузки обновления:', error);
    info.textContent = 'Ошибка: ' + error.message;
    info.style.color = '#c62828';
    button.textContent = 'Проверить обновления';
    button.disabled = false;
    button.onclick = handleCheckUpdates;
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  
  // Показываем текущую версию
  const version = chrome.runtime.getManifest().version;
  document.getElementById('currentVersion').textContent = version;
  
  document.getElementById('save').addEventListener('click', saveSettings);
  document.getElementById('reset').addEventListener('click', resetSettings);
  document.getElementById('checkUpdates').addEventListener('click', handleCheckUpdates);
  
  // Сохранение по Enter
  document.getElementById('prefix').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveSettings();
    }
  });
  
  document.getElementById('startNumber').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveSettings();
    }
  });
});
