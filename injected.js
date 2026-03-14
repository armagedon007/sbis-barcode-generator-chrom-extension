// Этот скрипт выполняется в контексте страницы для доступа к window.wsConfig
(function() {
  // Ждём загрузки wsConfig
  const checkConfig = () => {
    if (typeof window.wsConfig !== 'undefined') {
      const configData = {
        appId: window.wsConfig.xSabyAppId || '',
        appVersion: window.wsConfig.xSabyAppVersion || '',
        cfgId: window.wsConfig.xSabyCfgId || ''
      };
      
      // Отправляем через CustomEvent
      window.dispatchEvent(new CustomEvent('sbis-config-ready', { 
        detail: configData 
      }));
    } else {
      setTimeout(checkConfig, 100);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkConfig);
  } else {
    checkConfig();
  }
})();
