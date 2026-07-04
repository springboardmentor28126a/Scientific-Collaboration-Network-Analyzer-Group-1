import tkinter as tk
from tkinter import ttk
from tkinter import messagebox


class LoginPage(tk.Frame):

    def __init__(self, parent, controller):
        super().__init__(parent, bg="white")

        self.controller = controller

        # Title
        title = tk.Label(
            self,
            text="Login",
            font=("Helvetica", 24, "bold"),
            bg="white"
        )
        title.pack(pady=20)

        # Role
        tk.Label(
            self,
            text="Select Role",
            font=("Arial", 12),
            bg="white"
        ).pack()

        self.role = ttk.Combobox(
            self,
            values=[
                "Researcher",
                "Institution Admin",
                "Reviewer",
                "System Admin"
            ],
            state="readonly",
            width=30
        )

        self.role.current(0)
        self.role.pack(pady=10)

        # Email
        tk.Label(
            self,
            text="Email",
            font=("Arial", 12),
            bg="white"
        ).pack()

        self.email = ttk.Entry(self, width=35)
        self.email.pack(pady=5)

        # Password
        tk.Label(
            self,
            text="Password",
            font=("Arial", 12),
            bg="white"
        ).pack()

        self.password = ttk.Entry(
            self,
            width=35,
            show="*"
        )
        self.password.pack(pady=5)

        # Login Button
        ttk.Button(
            self,
            text="Login",
            command=self.login
        ).pack(pady=20)

        # Back Button
        ttk.Button(
            self,
            text="Back",
            command=lambda: controller.show_frame("LandingPage")
        ).pack()

    def login(self):

        if self.email.get() == "" or self.password.get() == "":
            messagebox.showerror(
                "Error",
                "Please enter email and password."
            )
            return

        messagebox.showinfo(
            "Success",
            f"Logged in as {self.role.get()}"
        )

        self.controller.show_frame("Dashboard")