import tkinter as tk

from landing import LandingPage
from login import LoginPage
from signup import SignupPage
from dashboard import Dashboard


class App(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Scientific Collaboration Network Analyzer")
        self.geometry("1000x650")
        self.resizable(False, False)
        self.configure(bg="white")

        container = tk.Frame(self)
        container.pack(fill="both", expand=True)

        container.grid_rowconfigure(0, weight=1)
        container.grid_columnconfigure(0, weight=1)

        self.frames = {}

        pages = {
            "LandingPage": LandingPage,
            "LoginPage": LoginPage,
            "SignupPage": SignupPage,
            "Dashboard": Dashboard,
        }

        for page_name, PageClass in pages.items():
            frame = PageClass(container, self)
            self.frames[page_name] = frame
            frame.grid(row=0, column=0, sticky="nsew")

        self.show_frame("LandingPage")

    def show_frame(self, page_name):
        frame = self.frames[page_name]
        frame.tkraise()


if __name__ == "__main__":
    app = App()
    app.mainloop()