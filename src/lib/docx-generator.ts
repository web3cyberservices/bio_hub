'use client';

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface LabMarker {
  name: string;
  value: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low';
  interpretation: string;
}

interface LabData {
  summary: string;
  markers: LabMarker[];
  recommendations: string[];
  createdAt: any;
}

function toSafeDate(dateValue: any): Date {
  if (!dateValue) return new Date();
  try {
    if (typeof dateValue.toDate === 'function') return dateValue.toDate();
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch (e) {
    return new Date();
  }
}

export async function downloadLabResultsDocx(data: LabData) {
  const dateObj = toSafeDate(data.createdAt);
  const docDate = format(dateObj, 'dd.MM.yyyy', { locale: ru });
  
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Bio Hub Pro | LabScan AI Report",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Отчет по результатам анализа от ${docDate}`,
                bold: true,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [new TextRun({ text: "Общее заключение ИИ:", bold: true, size: 22 })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: data.summary, italic: true })],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [new TextRun({ text: "Детализация биомаркеров:", bold: true, size: 22 })],
            spacing: { after: 200 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Показатель", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Значение (Норма)", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Интерпретация", bold: true })] }),
                ],
              }),
              ...data.markers.map(m => {
                const isOffNorm = m.status !== 'normal';
                // Чистим range от лишнего текста, если ИИ все же что-то добавил
                const range = m.referenceRange || '';
                
                // Формат строго по запросу пользователя: "Значение (норма Интервал)"
                // Убираем лишнее слово "норма", если оно уже есть в строке от ИИ
                const displayValue = range 
                  ? `${m.value} (норма ${range.replace(/норма/gi, '').trim()})`
                  : m.value;

                return new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(m.name)] }),
                    new TableCell({ 
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: displayValue,
                              bold: isOffNorm,
                              color: m.status === 'normal' ? '2D7A4D' : (m.status === 'high' ? 'EF4444' : 'EAB308')
                            })
                          ]
                        })
                      ] 
                    }),
                    new TableCell({ children: [new Paragraph(m.interpretation)] }),
                  ],
                });
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { before: 400 } }),
          new Paragraph({
            children: [new TextRun({ text: "Персональные рекомендации:", bold: true, size: 22 })],
            spacing: { after: 200 },
          }),
          ...data.recommendations.map(rec => new Paragraph({
            text: `• ${rec}`,
            spacing: { after: 100 },
          })),

          new Paragraph({ text: "", spacing: { before: 800 } }),
          new Paragraph({
            children: [
              new TextRun({ 
                text: "Внимание: Данный отчет составлен ИИ и носит информационный характер. Пожалуйста, проконсультируйтесь со специалистом.",
                size: 16,
                color: "666666"
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Bio_Hub_Pro_Report_${docDate.replace(/\./g, '_')}.docx`);
}
