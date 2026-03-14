// Функция для вывода отладочных сообщений
let debugMode = false;

function debugLog(...args) {
  if (debugMode) {
    console.log(...args);
  }
}

// Получение настроек из storage
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ prefix: '62', startNumber: 100000, lastNumber: 0, debugMode: false }, (items) => {
      resolve(items);
    });
  });
}

// Обновление режима отладки
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateDebugMode') {
    debugMode = request.debugMode;
    debugLog('[SBIS Barcode] Режим отладки:', debugMode ? 'включен' : 'выключен');
  }
});

// Инициализация режима отладки (синхронно)
chrome.storage.sync.get({ debugMode: false }, (items) => {
  debugMode = items.debugMode;
  debugLog('[SBIS Barcode] Скрипт content.js загружен!');
  debugLog('[SBIS Barcode] Режим отладки:', debugMode ? 'включен' : 'выключен');
  debugLog('[SBIS Barcode] document.readyState:', document.readyState);
  
  // Инициализация после загрузки настроек
  if (document.readyState === 'loading') {
    debugLog('[SBIS Barcode] Ожидаем DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    debugLog('[SBIS Barcode] DOM уже загружен, инициализируем сразу');
    init();
  }
});

// Сохранение последнего номера
async function saveLastNumber(lastNumber) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ lastNumber }, () => {
      resolve();
    });
  });
}

// Генерация EAN-13 штрихкода
async function generateEAN13() {
  const settings = await getSettings();
  const prefix = settings.prefix || '62';
  const startNumber = settings.startNumber || 100000;
  let lastNumber = settings.lastNumber || 0;
  
  // Если это первая генерация, начинаем со startNumber
  if (lastNumber === 0) {
    lastNumber = startNumber;
  } else {
    // Иначе увеличиваем на 1
    lastNumber++;
  }
  
  // Формируем код: префикс + число с нулями слева
  const remainingDigits = 12 - prefix.length;
  const numberStr = lastNumber.toString().padStart(remainingDigits, '0');
  const code12 = prefix + numberStr;
  
  // Вычисляем контрольную сумму
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code12[i]);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  const checksum = (10 - (sum % 10)) % 10;
  
  const fullCode = code12 + checksum;
  
  // Сохраняем последний номер
  await saveLastNumber(lastNumber);
  
  return fullCode;
}

// Получение конфигурации СБИС
function getSbisConfig() {
  if (typeof window.wsConfig !== 'undefined') {
    return {
      appId: window.wsConfig.xSabyAppId || '',
      appVersion: window.wsConfig.xSabyAppVersion || '',
      cfgId: window.wsConfig.xSabyCfgId || ''
    };
  }
  return {
    appId: '',
    appVersion: '',
    cfgId: ''
  };
}

// Проверка уникальности кода через API СБИС
async function checkBarcodeUnique(barcode) {
  try {
    const config = getSbisConfig();
    
    const response = await fetch('https://ret.sbis.ru/service/?x_version=26.1227-168.2', {
      method: 'POST',
      headers: {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/json; charset=UTF-8',
        'x-calledmethod': 'Nomenclature.List',
        'x-requested-with': 'XMLHttpRequest',
        'x-saby-appid': config.appId,
        'x-saby-appversion': config.appVersion,
        'x-saby-cfgid': config.cfgId
      },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0',
        protocol: 7,
        method: 'Nomenclature.List',
        params: {
          Фильтр: {
            d: [
              null, null, true, null, null, null, true,
              { d: ['desktop'], s: [{ t: 'Строка', n: 'Device' }], _type: 'record', f: 1 },
              null, false, null, null, 0, true, false, 1, null, true, null, null,
              ['Catalog'],
              barcode,
              { d: [null, null, null], s: [{ t: 'Число целое', n: 'Breadcrumbs' }, { t: 'Число целое', n: 'NodeType' }, { t: 'Число целое', n: 'FolderPriority' }], _type: 'record', f: 2 },
              { d: [true], s: [{ t: 'Логическое', n: 'HideConditionalProduct' }], _type: 'record', f: 3 },
              null, true, null, null, null, 'full', 'С разворотом'
            ],
            s: [
              { t: 'Строка', n: 'Archival' },
              { t: 'Строка', n: 'Balance' },
              { t: 'Логическое', n: 'BalanceEmptyFolder' },
              { t: 'Строка', n: 'BalanceForOrganization' },
              { t: 'Строка', n: 'BarcodeExist' },
              { t: 'Строка', n: 'Category' },
              { t: 'Логическое', n: 'CheckFolderExists' },
              { t: 'Запись', n: 'ConfigurationOption' },
              { t: 'Строка', n: 'Envd' },
              { t: 'Логическое', n: 'FlatMode' },
              { t: 'Строка', n: 'FolderUI' },
              { t: 'Строка', n: 'GetColumnsFromSettings' },
              { t: 'Число целое', n: 'GetPath' },
              { t: 'Логическое', n: 'GetRights' },
              { t: 'Логическое', n: 'HideEmptyFolder' },
              { t: 'Число целое', n: 'Link' },
              { t: 'Строка', n: 'MarkColor' },
              { t: 'Логическое', n: 'NewConfiguration' },
              { t: 'Строка', n: 'NodeType' },
              { t: 'Строка', n: 'PublicationSaleState' },
              { t: { n: 'Массив', t: 'Строка' }, n: 'ScopesAreas' },
              { t: 'Строка', n: 'SearchString' },
              { t: 'Запись', n: 'SearchStringOption' },
              { t: 'Запись', n: 'ServiceOption' },
              { t: 'Строка', n: 'StateSystem' },
              { t: 'Логическое', n: 'TranslitSearchString' },
              { t: 'Строка', n: 'Type' },
              { t: 'Строка', n: 'Vat' },
              { t: 'Строка', n: 'Warehouse' },
              { t: 'Строка', n: 'usePages' },
              { t: 'Строка', n: 'Разворот' }
            ],
            _type: 'record',
            f: 0
          },
          Сортировка: {
            d: [[true, 'Name', false]],
            s: [
              { t: 'Логическое', n: 'l' },
              { t: 'Строка', n: 'n' },
              { t: 'Логическое', n: 'o' }
            ],
            _type: 'recordset',
            f: 0
          },
          Навигация: {
            d: [true, 30, 0],
            s: [
              { t: 'Логическое', n: 'ЕстьЕще' },
              { t: 'Число целое', n: 'РазмерСтраницы' },
              { t: 'Число целое', n: 'Страница' }
            ],
            _type: 'record',
            f: 0
          },
          ДопПоля: ['Code']
        },
        id: 1
      })
    });
    
    const data = await response.json();
    
    if (data.result && data.result.d) {
      const items = data.result.d;
      return items.length === 0;
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка проверки штрихкода:', error);
    return true;
  }
}

// Генерация уникального штрихкода
async function generateUniqueBarcode(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const barcode = await generateEAN13();
    const isUnique = await checkBarcodeUnique(barcode);
    
    if (isUnique) {
      return barcode;
    }
  }
  
  throw new Error('Не удалось сгенерировать уникальный штрихкод');
}

// Вставка штрихкода в поле ввода
function insertBarcodeIntoInput(input, barcode) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeInputValueSetter.call(input, barcode);
  
  const inputEvent = new Event('input', { bubbles: true, cancelable: true });
  input.dispatchEvent(inputEvent);
  
  const changeEvent = new Event('change', { bubbles: true, cancelable: true });
  input.dispatchEvent(changeEvent);
  
  input.focus();
  input.blur();
}

// Обработчик клика на кнопку генерации
async function handleGenerateClick(event) {
  debugLog('[SBIS Barcode] Клик обнаружен:', event.target);
  
  const button = event.target.closest('.controls-BaseButton');
  debugLog('[SBIS Barcode] Кнопка найдена:', button);
  
  if (!button) return;
  
  const icon = button.querySelector('.icon-Lightning');
  debugLog('[SBIS Barcode] Иконка молнии найдена:', icon);
  
  if (!icon) return;
  
  try {
    const container = button.closest('.wnc-core-code-value-editor');
    debugLog('[SBIS Barcode] Контейнер найден:', container);
    
    if (!container) return;
    
    const dropdown = container.querySelector('.controls-Dropdown__text');
    const dropdownText = dropdown ? dropdown.textContent.trim() : '';
    debugLog('[SBIS Barcode] Тип кода:', dropdownText);
    
    const isBarcode = dropdownText === 'Штрихкод' || dropdownText.includes('Штрихкод');
    debugLog('[SBIS Barcode] Это штрихкод?', isBarcode);
    
    if (!dropdown || !isBarcode) {
      debugLog('[SBIS Barcode] Пропускаем - не штрихкод');
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const input = container.querySelector('input.controls-Field.js-controls-Field.controls-InputBase__nativeField');
    debugLog('[SBIS Barcode] Поле ввода найдено:', input);
    
    if (!input) return;
    
    button.style.opacity = '0.5';
    button.style.pointerEvents = 'none';
    
    debugLog('[SBIS Barcode] Генерация штрихкода...');
    const barcode = await generateUniqueBarcode();
    debugLog('[SBIS Barcode] Сгенерирован код:', barcode);
    
    insertBarcodeIntoInput(input, barcode);
    debugLog('[SBIS Barcode] Код вставлен в поле');
    
  } catch (error) {
    console.error('[SBIS Barcode] Ошибка генерации штрихкода:', error);
    alert('Ошибка генерации штрихкода: ' + error.message);
  } finally {
    const button = event.target.closest('.controls-BaseButton');
    if (button) {
      button.style.opacity = '';
      button.style.pointerEvents = '';
    }
  }
}

// Инициализация расширения
function init() {
  debugLog('[SBIS Barcode] Расширение инициализировано');
  debugLog('[SBIS Barcode] URL:', window.location.href);
  debugLog('[SBIS Barcode] wsConfig:', typeof window.wsConfig !== 'undefined' ? 'найден' : 'не найден');
  
  document.addEventListener('click', handleGenerateClick, true);
  debugLog('[SBIS Barcode] Обработчик клика установлен');
}
