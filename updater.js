// Конфигурация обновлений
const UPDATE_CONFIG = {
  githubRepo: 'armagedon007/sbis-barcode-generator-chrom-extension',
  branch: 'main',
  files: [
    'manifest.json',
    'content.js',
    'background.js',
    'popup.html',
    'popup.js'
  ]
};

// Проверка обновлений
async function checkForUpdates() {
  try {
    const currentVersion = chrome.runtime.getManifest().version;
    
    // Получаем manifest.json из GitHub
    const manifestUrl = `https://raw.githubusercontent.com/${UPDATE_CONFIG.githubRepo}/${UPDATE_CONFIG.branch}/manifest.json`;
    const response = await fetch(manifestUrl);
    
    if (!response.ok) {
      throw new Error('Не удалось получить информацию об обновлении');
    }
    
    const remoteManifest = await response.json();
    const remoteVersion = remoteManifest.version;
    
    // Сравниваем версии
    if (compareVersions(remoteVersion, currentVersion) > 0) {
      return {
        available: true,
        currentVersion,
        remoteVersion
      };
    }
    
    return {
      available: false,
      currentVersion,
      remoteVersion
    };
  } catch (error) {
    console.error('Ошибка проверки обновлений:', error);
    throw error;
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

// Загрузка обновлений
async function downloadUpdates() {
  try {
    const updates = {};
    
    for (const file of UPDATE_CONFIG.files) {
      const fileUrl = `https://raw.githubusercontent.com/${UPDATE_CONFIG.githubRepo}/${UPDATE_CONFIG.branch}/${file}`;
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Не удалось загрузить файл: ${file}`);
      }
      
      const content = await response.text();
      updates[file] = content;
    }
    
    return updates;
  } catch (error) {
    console.error('Ошибка загрузки обновлений:', error);
    throw error;
  }
}

// Применение обновлений (требует перезагрузки расширения)
async function applyUpdates(updates) {
  // Сохраняем обновления в storage
  await chrome.storage.local.set({ pendingUpdates: updates });
  
  // Уведомляем пользователя о необходимости перезагрузки
  return {
    success: true,
    message: 'Обновления загружены. Перезагрузите расширение в chrome://extensions/'
  };
}

// Экспорт функций
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkForUpdates,
    downloadUpdates,
    applyUpdates
  };
}
