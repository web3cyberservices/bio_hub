'use client';

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface LabMarker {
  name: string;
  value: string;
  status: 'normal' | 'high' | 'low';
  interpretation: string;
}

interface LabData {
  summary: string;
  markers: LabMarker[];
  recommendations: string[];
  createdAt: string;
}

/**
 * Генерирует и скачивает DOCX файл с результатами анализа.
 */
export async function downloadLabResultsDocx(data: LabData) {
  const docDate = format(new Date(data.createdAt), 'dd.MM.yyyy', { locale: ru });
  
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "PRO Себя | LabScan AI Report",
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
            children: [
              new TextRun({ text: "Общее заключение ИИ:", bold: true, size: 22 }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: data.summary, italic: true }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Детализация биомаркеров:", bold: true, size: 22 }),
            ],
            spacing: { after: 200 },
          }),

          // Таблица маркеров
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Показатель", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Значение", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Интерпретация", bold: true })] }),
                ],
              }),
              ...data.markers.map(m => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(m.name)] }),
                  new TableCell({ children: [new Paragraph({
                    children: [
                      new TextRun({
                        text: m.value,
                        bold: true,
                        color: m.status === 'normal' ? '2D7A4D' : (m.status === 'high' ? 'EF4444' : 'EAB308')
                      })
                    ]
                  })] }),
                  new TableCell({ children: [new Paragraph(m.interpretation)] }),
                ],
              })),
            ],
          }),

          new Paragraph({
            text: "",
            spacing: { before: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Персональные рекомендации:", bold: true, size: 22 }),
            ],
            spacing: { after: 200 },
          }),

          ...data.recommendations.map(rec => new Paragraph({
            text: `• ${rec}`,
            spacing: { after: 100 },
          })),

          new Paragraph({
            text: "",
            spacing: { before: 800 },
          }),
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
  saveAs(blob, `PRO_Sebya_Report_${docDate.replace(/\./g, '_')}.docx`);
}
