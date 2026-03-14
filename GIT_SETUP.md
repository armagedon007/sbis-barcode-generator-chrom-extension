# Настройка Git репозитория для автообновления

## Шаг 1: Инициализация репозитория

```bash
cd chrome
git init
git add .
git commit -m "Initial commit: СБИС Barcode Generator v1.0.0"
```

## Шаг 2: Создание репозитория на GitHub

1. Перейдите на https://github.com/new
2. Создайте новый репозиторий (например: `sbis-barcode-generator`)
3. НЕ добавляйте README, .gitignore или лицензию (они уже есть)

## Шаг 3: Подключение к GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/sbis-barcode-generator.git
git branch -M main
git push -u origin main
```

## Шаг 4: Настройка автообновления

Отредактируйте файл `updater.js`:

```javascript
const UPDATE_CONFIG = {
  githubRepo: 'YOUR_USERNAME/sbis-barcode-generator', // Замените на ваш репозиторий
  branch: 'main',
  // ...
};
```

Замените `YOUR_USERNAME/sbis-barcode-generator` на ваш репозиторий.

## Шаг 5: Выпуск новой версии

Когда нужно выпустить обновление:

1. Внесите изменения в код
2. Обновите версию в `manifest.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```
3. Закоммитьте и отправьте изменения:
   ```bash
   git add .
   git commit -m "Release v1.0.1: описание изменений"
   git push
   ```

## Как работает автообновление

1. Пользователь нажимает "Проверить обновления" в popup
2. Расширение загружает `manifest.json` из GitHub
3. Сравнивает версии (текущая vs GitHub)
4. Если версия на GitHub новее - предлагает загрузить обновление
5. Загружает обновленные файлы и сохраняет в storage
6. Пользователь перезагружает расширение в `chrome://extensions/`

## Файлы, которые обновляются автоматически

- manifest.json
- content.js
- background.js
- popup.html
- popup.js

Список можно изменить в `updater.js` в массиве `UPDATE_CONFIG.files`.
