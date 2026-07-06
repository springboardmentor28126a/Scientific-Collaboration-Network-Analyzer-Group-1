import tkinter as tk
from tkinter import ttk


class LandingPage(tk.Frame):

    def __init__(self, parent, controller):
        super().__init__(parent, bg="#0F172A")

        self.controller = controller

        title = tk.Label(
            self,
            text="Scientific Collaboration\nNetwork Analyzer",
            font=("Helvetica", 30, "bold"),
            fg="white",
            bg="#0F172A",
            justify="center"
        )

        title.pack(pady=100)

        style = ttk.Style()
        style.theme_use("clam")

        style.configure(
            "Custom.TButton",
            font=("Arial", 13, "bold"),
            padding=10
        )

        ttk.Button(
            self,
            text="Login",
            style="Custom.TButton",
            width=20,
            command=lambda: controller.show_frame("LoginPage")
        ).pack(pady=10)

        ttk.Button(
            self,
            text="Sign Up",
            style="Custom.TButton",
            width=20,
            command=lambda: controller.show_frame("SignupPage")
        ).pack(pady=10)

        ttk.Button(
            self,
            text="Get Started",
            style="Custom.TButton",
            width=20,
            command=lambda: controller.show_frame("LoginPage")
        ).pack(pady=25)