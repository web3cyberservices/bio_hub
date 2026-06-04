
/**
 * @fileOverview Сервис локального хранения документов специалиста.
 * КРИТИЧЕСКИ: Данные хранятся только в IndexedDB браузера и никогда не передаются на сервер.
 */
import { get, set, update, del } from 'idb-keyval';

export interface DiarySource {
  id: string;
  patientId: string;
  name: string;
  content: string;
  type: 'pdf' | 'txt' | 'docx';
  createdAt: string;
}

const STORAGE_KEY = 'specialist_diary_sources';

export async function saveSourceLocal(source: DiarySource): Promise<void> {
  const current = await get<DiarySource[]>(STORAGE_KEY) || [];
  await set(STORAGE_KEY, [...current, source]);
}

export async function getSourcesLocal(patientId: string): Promise<DiarySource[]> {
  const all = await get<DiarySource[]>(STORAGE_KEY) || [];
  return all.filter(s => s.patientId === patientId);
}

export async function deleteSourceLocal(id: string): Promise<void> {
  const all = await get<DiarySource[]>(STORAGE_KEY) || [];
  await set(STORAGE_KEY, all.filter(s => s.id !== id));
}

export async function updateSourceContent(id: string, newContent: string): Promise<void> {
  const all = await get<DiarySource[]>(STORAGE_KEY) || [];
  const updated = all.map(s => s.id === id ? { ...s, content: newContent } : s);
  await set(STORAGE_KEY, updated);
}
