// Загрузка настроек
function loadSettings() {
  chrome.storage.sync.get({ prefix: '62', startNumber: 100000, lastNumber: 0 }, (items) => {
    document.getElementById('prefix').value = items.prefix;
    document.getElementById('startNumber').value = items.startNumber;
  });
}

// Сохранение настроек
function saveSettings() {
  const prefix = document.getElementById('prefix').value.trim();
  const startNumber = parseInt(document.getElementById('startNumber').value) || 100000;
  
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
  
  chrome.storage.sync.set({ prefix, startNumber }, () => {
    showStatus('✓ Настройки сохранены', 'success');
  });
}

// Сброс настроек
function resetSettings() {
  chrome.storage.sync.set({ prefix: '62', startNumber: 100000, lastNumber: 0 }, () => {
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
    const updateInfo = await checkForUpdates();
    
    if (updateInfo.available) {
      info.textContent = `Доступна новая версия ${updateInfo.remoteVersion} (текущая: ${updateInfo.currentVersion})`;
      info.style.color = '#2e7d32';
      
      // Предлагаем загрузить обновление
      button.textContent = 'Загрузить обновление';
      button.disabled = false;
      button.onclick = handleDownloadUpdate;
    } else {
      info.textContent = `У вас установлена последняя версия ${updateInfo.currentVersion}`;
      info.style.color = '#666';
      button.textContent = 'Проверить обновления';
      button.disabled = false;
    }
  } catch (error) {
    info.textContent = 'Ошибка проверки обновлений. Проверьте настройки репозитория.';
    info.style.color = '#c62828';
    button.textContent = 'Проверить обновления';
    button.disabled = false;
  }
}

// Загрузка обновления
async function handleDownloadUpdate() {
  const button = document.getElementById('checkUpdates');
  const info = document.getElementById('updateInfo');
  
  button.disabled = true;
  button.textContent = 'Загрузка...';
  
  try {
    const updates = await downloadUpdates();
    const result = await applyUpdates(updates);
    
    info.textContent = result.message;
    info.style.color = '#2e7d32';
    button.textContent = 'Обновление загружено';
  } catch (error) {
    info.textContent = 'Ошибка загрузки обновления';
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
