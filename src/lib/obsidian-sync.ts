/**
 * @fileOverview Сервис тотальной синхронизации данных Bio Hub Pro с Obsidian.
 * Использует File System Access API и IndexedDB для работы с локальными файлами.
 * Поддерживает архитектуру связного графа (Frontmatter + Wiki-links).
 */
import { get as getInIdb } from 'idb-keyval';

export interface ObsidianSyncData {
  type: 'daily' | 'meal' | 'lab' | 'medication' | 'profile' | 'workout' | 'fasting';
  date?: string;
  payload: any;
}

async function getVaultHandle() {
  try {
    const handle = await getInIdb('obsidian_vault_handle');
    if (!handle) return null;
    
    const options = { mode: 'readwrite' };
    if ((await (handle as any).queryPermission(options)) !== 'granted') {
      if ((await (handle as any).requestPermission(options)) !== 'granted') {
        return null;
      }
    }
    return handle as FileSystemDirectoryHandle;
  } catch (e) {
    console.error('Obsidian Access Error:', e);
    return null;
  }
}

async function getOrCreateDir(parent: FileSystemDirectoryHandle, name: string) {
  return await parent.getDirectoryHandle(name, { create: true });
}

async function writeToFile(dir: FileSystemDirectoryHandle, fileName: string, content: string, append = false) {
  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  const writable = await (fileHandle as any).createWritable();
  
  let finalContent = content;
  if (append) {
    const file = await fileHandle.getFile();
    const existingContent = await file.text();
    finalContent = existingContent + '\n' + content;
  }
  
  await writable.write(finalContent);
  await writable.close();
}

export async function syncToObsidian(data: ObsidianSyncData) {
  const root = await getVaultHandle();
  if (!root) return false;

  try {
    const bioHubDir = await getOrCreateDir(root, 'BioHub');
    const dateStr = data.date || new Date().toISOString().split('T')[0];

    switch (data.type) {
      case 'profile': {
        const content = generateProfileMarkdown(data.payload);
        await writeToFile(bioHubDir, 'Profile.md', content);
        break;
      }
      case 'daily': {
        const dailyLogsDir = await getOrCreateDir(bioHubDir, 'DailyLogs');
        const fileName = `${dateStr}.md`;
        const content = generateDailyMarkdown(data.payload, dateStr);
        await writeToFile(dailyLogsDir, fileName, content);
        break;
      }
      case 'meal': {
        const dailyLogsDir = await getOrCreateDir(bioHubDir, 'DailyLogs');
        const fileName = `${dateStr}.md`;
        const mealContent = `\n### Прием пищи (${new Date().toLocaleTimeString('ru-RU')})\n- **Блюдо:** ${data.payload.name}\n- **КБЖУ:** ${data.payload.calories} ккал (Б:${data.payload.protein} Ж:${data.payload.fat} У:${data.payload.carbs})\n- **Связь:** [[${dateStr}]]\n`;
        await writeToFile(dailyLogsDir, fileName, mealContent, true);
        break;
      }
      case 'workout': {
        const workoutsDir = await getOrCreateDir(bioHubDir, 'Workouts');
        const fileName = `${dateStr}-${data.payload.title.replace(/\s+/g, '_')}.md`;
        const content = generateWorkoutMarkdown(data.payload, dateStr);
        await writeToFile(workoutsDir, fileName, content);
        break;
      }
      case 'fasting': {
        const fileName = `FastingHistory.md`;
        const fastingContent = `\n- **Дата:** [[${dateStr}]] | **Режим:** ${data.payload.mode} | **Статус:** ${data.payload.status} | **Начало:** ${new Date(data.payload.start).toLocaleTimeString('ru-RU')}\n`;
        await writeToFile(bioHubDir, fileName, fastingContent, true);
        break;
      }
      case 'lab': {
        const labsDir = await getOrCreateDir(bioHubDir, 'Labs');
        const fileName = `Report-${dateStr}-${Date.now().toString().slice(-4)}.md`;
        const content = generateLabMarkdown(data.payload, dateStr);
        await writeToFile(labsDir, fileName, content);
        break;
      }
      case 'medication': {
        const fileName = `Medications.md`;
        const content = generateMedsMarkdown(data.payload);
        await writeToFile(bioHubDir, fileName, content);
        break;
      }
    }
    return true;
  } catch (err) {
    console.error('Obsidian Sync Failed:', err);
    return false;
  }
}

function generateProfileMarkdown(data: any) {
  return `---
type: bio-profile
id: ${data.id || 'current-user'}
gender: ${data.gender}
goal: ${data.healthGoal}
activity_level: ${data.activityLevel}
updated_at: ${new Date().toISOString()}
---
# Профиль Bio Hub Pro: ${data.firstName} ${data.lastName || ''}
*Обновлено: ${new Date().toLocaleString('ru-RU')}*

## Основные данные
- **Пол:** ${data.gender}
- **Дата рождения:** ${data.birthDate || '--'}
- **Рост:** ${data.height} см
- **Вес:** ${data.weight} кг

## Цели и Активность
- **Цель:** ${data.healthGoal}
- **Уровень активности:** ${data.activityLevel}
- **Курение:** ${data.smoking}
- **Алкоголь:** ${data.alcohol}

## Работа
- **Профессия:** ${data.occupation || '--'}
- **Тип нагрузки:** ${data.workActivityType === 'mental' ? 'Умственная' : 'Физическая'}
- **Часов в день:** ${data.workHoursPerDay}

## Предпочтения
- **Любимые продукты:** ${data.favoriteFoods || '--'}
- **Исключить:** ${data.dislikedFoods || '--'}

---
Generated by Bio Hub Pro
`;
}

function generateDailyMarkdown(data: any, date: string) {
  return `---
type: bio-log
date: ${date}
weight: ${data.weight || 0}
steps: ${data.steps || 0}
sleep: ${data.sleepDurationHours || 0}
water: ${data.water || 0}
energy: ${data.energy || 50}
mood: ${data.mood || 'Normal'}
---
# Bio-Log: ${date}

## Метрики тела
- **Вес:** ${data.weight || '--'} кг
- **Шаги:** ${data.steps || 0}
- **Сон:** ${data.sleepDurationHours || 0} ч
- **Вода:** ${data.water || 0} мл

## Состояние
- **Энергия:** ${data.energy || 50}%
- **Настроение:** ${data.mood || 'Нормальное'}

## Симптомы
${Object.entries(data.symptoms || {}).map(([id, val]) => `- ${id}: ${val}/10`).join('\n')}

---
Generated by Bio Hub Pro
`;
}

function generateWorkoutMarkdown(data: any, date: string) {
  return `---
type: health-metric
category: workout
date: ${date}
status: ${data.status}
exercises_count: ${data.exercises?.length || 0}
---
# Тренировка: ${data.title}
**Дата:** [[${date}]]
**Статус:** ${data.status}

## Упражнения
| Упражнение | Подходы | Повторения | Вес |
| :--- | :--- | :--- | :--- |
${data.exercises.map((ex: any) => `| ${ex.name} | ${ex.sets} | ${ex.reps} | ${ex.weight} |`).join('\n')}

---
Синхронизировано из Bio Hub Pro
`;
}

function generateLabMarkdown(data: any, date: string) {
  const labDate = new Date(data.createdAt).toISOString().split('T')[0];
  return `---
type: health-metric
category: lab-result
date: ${labDate}
markers_count: ${data.markers?.length || 0}
---
# Лабораторный отчет: ${new Date(data.createdAt).toLocaleDateString('ru-RU')}
Связанный день: [[${labDate}]]

## Заключение ИИ
> ${data.summary}

## Биомаркеры
| Показатель | Значение | Статус | Интерпретация |
| :--- | :--- | :--- | :--- |
${data.markers.map((m: any) => `| ${m.name} | ${m.value} | ${m.status.toUpperCase()} | ${m.interpretation} |`).join('\n')}

## Рекомендации
${data.recommendations.map((r: string) => `- ${r}`).join('\n')}

---
*Данный отчет сформирован ИИ и требует консультации врача.*
`;
}

function generateMedsMarkdown(meds: any[]) {
  return `---
type: bio-inventory
category: medications
updated_at: ${new Date().toISOString()}
meds_count: ${meds.length}
---
# Список препаратов и БАДов
*Обновлено: ${new Date().toLocaleString('ru-RU')}*

| Название | Время | Дозировка | Тип | Связь с едой |
| :--- | :--- | :--- | :--- | :--- |
${meds.map((m: any) => `| ${m.name} | ${m.time} | ${m.dosage} ${m.form} | ${m.type} | ${m.mealRelation} |`).join('\n')}

---
Синхронизировано из Bio Hub Pro
`;
}
