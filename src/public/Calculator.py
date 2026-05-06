import customtkinter as ctk

class HematologyApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Biohub: Hematology Calculator")
        self.geometry("400x580")
        ctk.set_appearance_mode("dark") 

        # Заголовок
        self.label = ctk.CTkLabel(self, text="Расчет индексов (ЖДА / Талассемия)", font=("Arial", 16, "bold"))
        self.label.pack(pady=20)

        # Поля ввода
        self.entries = {}
        fields = [("RBC (Эритроциты)", "4.5"), ("Hb (Гемоглобин)", "110"), 
                  ("MCV", "75"), ("MCH", "24"), ("RDW", "15.5")]

        for field, default in fields:
            frame = ctk.CTkFrame(self, fg_color="transparent")
            frame.pack(fill="x", padx=30, pady=5)
            
            lbl = ctk.CTkLabel(frame, text=field, width=150, anchor="w")
            lbl.pack(side="left")
            
            entry = ctk.CTkEntry(frame, width=100)
            entry.insert(0, default)
            entry.pack(side="right")
            self.entries[field] = entry

        # Кнопка расчета
        self.btn = ctk.CTkButton(self, text="Рассчитать", command=self.calculate, fg_color="#2c67f2")
        self.btn.pack(pady=30)

        # Поле результата
        self.result_text = ctk.CTkTextbox(self, height=150, width=340)
        self.result_text.pack(padx=20, pady=10)

    def calculate(self):
        try:
            # Получение данных
            r = float(self.entries["RBC (Эритроциты)"].get())
            h = float(self.entries["Hb (Гемоглобин)"].get())
            mcv = float(self.entries["MCV"].get())
            mch = float(self.entries["MCH"].get())
            rdw = float(self.entries["RDW"].get())

            # Формулы из "Калькулятор_финал.xlsx"
            mentzer = round(mcv / r, 2)
            ehsani = round(mcv - (10 * r), 2)
            shine = round((mcv ** 2 * mch) / 100, 2)

            # Вывод
            res = f"ИНДЕКСЫ:\n"
            res += f"• Mentzer: {mentzer} ({'ЖДА' if mentzer > 13 else 'Талассемия'})\n"
            res += f"• Ehsani: {ehsani} ({'ЖДА' if ehsani > 15 else 'Талассемия'})\n"
            res += f"• Shine & Lal: {shine} ({'ЖДА' if shine > 1530 else 'Талассемия'})\n"
            
            self.result_text.delete("1.0", "end")
            self.result_text.insert("1.0", res)
        except Exception as e:
            self.result_text.insert("1.0", "Ошибка: Проверьте ввод данных")

if __name__ == "__main__":
    app = HematologyApp()
    app.mainloop()