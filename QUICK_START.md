# Быстрый старт

## 1. Установка (1 минута)

```
chrome://extensions/ → Режим разработчика → Загрузить распакованное → Выбрать папку chrome
```

## 2. Использование

1. Откройте СБИС
2. Выберите тип "Штрихкод"
3. Нажмите ⚡ (молния)
4. Готово!

## 3. Настройка автообновления (опционально)

```bash
cd chrome
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sbis-barcode-generator.git
git push -u origin main
```

Отредактируйте `updater.js`:
```javascript
githubRepo: 'YOUR_USERNAME/sbis-barcode-generator'
```

## Готово!

Подробности в [INSTALL.md](INSTALL.md) и [GIT_SETUP.md](GIT_SETUP.md)
