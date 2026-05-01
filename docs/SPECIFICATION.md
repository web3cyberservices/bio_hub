# Техническая спецификация Bio Hub Pro

**Bio Hub Pro** — это инновационная BioTech-платформа для управления здоровьем и эстетикой, использующая мультимодальный ИИ (Gemini) и локальную обработку данных.

---

## 1. Медицинский блок: Deep LabScan AI

### Функциональная логика
Глубокий анализ результатов анализов крови (OCR + интерпретация). Система не просто считывает цифры, а коррелирует их с профилем пользователя (возраст, пол, вес) и биометрией в реальном времени (пульс, сон, шаги). 
*Пример: Высокий уровень кортизола сопоставляется с данными о плохом сне (менее 5 часов) из Google Fit.*

### Стратегия промптинга (AI Strategy)
- **Role**: Clinical Biochemist & Longevity Expert.
- **Input**: OCR text from lab report + User Context (Age, Weight, BMI, Avg Sleep, Resting HR).
- **Task**: Identify markers outside personal (not just lab) norms. Calculate metabolic age.
- **Safety**: Always include a medical disclaimer and suggestion for clinical consultation.

### Требования к фронтенду
- **Uploader**: Компонент с поддержкой Drag-and-drop и захвата фото с камеры.
- **Charts**: Линейные графики Recharts для отслеживания динамики маркеров (например, Ферритин за 6 месяцев).
- **Badges**: Цветовая индикация рисков (Критично/В норме/Оптимально).

---

## 2. Блок Бьюти-аналитики: Aesthetic AI

### A. Ногти (Nails)
- **Логика**: Поиск визуальных маркеров дефицитов. Вертикальные волны/борозды -> дефицит железа/B12. Белые пятна -> дефицит цинка. Ломкость -> белок/кремний.
- **AI Strategy**: Visual detection of ridges, discoloration, and plate texture. Output: "Possible deficiency: Iron/Ferritin".
- **UI**: Макро-съемка (zoom-camera), индикаторы дефицитов в модальном окне.

### B. Волосы и Составы (Hair & Ingredients)
- **Логика**: Сканирование состава шампуня (OCR). Сопоставление с типом волос пользователя (жирные/сухие) и аллергиями. Выявление сульфатов (SLS), парабенов и силиконов.
- **AI Strategy**: OCR text extraction from curved surfaces (bottles). Cross-check vs "Red List" of ingredients.
- **UI**: Barcode/Label scanner, сравнительная таблица "Ваш тип волос vs Данный продукт".

### C. Кожа и Зубы (Skin/Teeth)
- **Логика**: Оценка текстуры кожи (увлажненность, поры) и состояния эмали (прозрачность, налет).
- **AI Strategy**: Computer Vision for texture analysis. Detect signs of dehydration or inflammation.
- **UI**: Зоны интереса на фото (overlay), ИИ-отчет с советами по уходу.

---

## 3. Lifestyle-интеграция: Bio-Flow

### Интервальное голодание (Fasting)
- **Логика**: Трекер 16:8 / 18:6. ИИ рассчитывает время входа в кетоз и аутофагию на основе последнего приема пищи и активности.
- **AI Strategy**: Dynamic adjustment of fasting windows based on physical load (Physical labor vs Mental).
- **UI**: Кольцевой таймер с фазами (Пищеварение -> Сжигание сахара -> Кетоз).

### КБЖУ и Нейро-сканер еды
- **Логика**: Расчет калорий по фото. Mifflin-St Jeor + уточнение по типу труда.
- **AI Strategy**: Identify dish ingredients, estimate volume (portion size), and calculate Macros.
- **UI**: Плавающие карточки нутриентов, прогресс-бары макросов.

---

## 4. Трекинг препаратов: Meds & Vitamins

### Функциональная логика
Мониторинг приема лекарств и БАДов. Анализ взаимодействия БАДов с результатами анализов.
*Пример: Если пользователь пьет Железо, ИИ проверяет уровень Гемоглобина в отчетах и дает сигнал, если показатель не растет (проблема всасывания).*

### Стратегия промптинга
- **Task**: Check drug-supplement interaction. Suggest optimal timing (Morning/Evening, with/without food).

### Требования к фронтенду
- **Timeline**: Календарный вид с отметками приема.
- **Alerts**: Пуш-уведомления (Telegram) о необходимости приема.

---

## 5. Контекст работы: Mental vs Physical

### Функциональная логика
Дифференциация советов. 
- **Умственный труд**: Акцент на Omega-3, Магний, Глицин, контроль синего света. 
- **Физический труд**: Акцент на электролиты, аминокислоты (BCAA), восстановление мышц.

---

## 6. Техническое ядро: Privacy & RAG

### Архитектура (Artix Linux / Local processing)
- **RAG (Retrieval-Augmented Generation)**: Использование локальной векторной базы данных для хранения медицинских справочников.
- **Privacy**: Персональные данные (PHI) обрабатываются локально или через защищенные туннели без трансграничной передачи (в соответствии с законом 99-З РБ).
- **Tech Stack**: Next.js, Firebase (Auth/Firestore), Genkit (Gemini 2.5 Flash), Vector DB.

---
© 2024 Bio Hub Pro Architecture Group.