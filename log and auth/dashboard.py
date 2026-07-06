import tkinter as tk


class Dashboard(tk.Frame):

    def __init__(self, parent, controller):
        super().__init__(parent)

        tk.Label(
            self,
            text="Dashboard",
            font=("Arial", 28, "bold")
        ).pack(pady=30)

        tk.Label(
            self,
            text="Welcome to the Scientific Collaboration Network Analyzer",
            font=("Arial", 15)
        ).pack()

        cards = tk.Frame(self)
        cards.pack(pady=40)

        for text in [
            "Researchers",
            "Publications",
            "Institutions",
            "Projects"
        ]:

            frame = tk.Frame(
                cards,
                relief="ridge",
                bd=2,
                width=180,
                height=120
            )

            frame.pack(side="left", padx=15)

            frame.pack_propagate(False)

            tk.Label(
                frame,
                text=text,
                font=("Arial", 14, "bold")
            ).pack(expand=True)