import tkinter as tk
from tkinter import ttk
from tkinter import messagebox


class SignupPage(tk.Frame):

    def __init__(self, parent, controller):
        super().__init__(parent, bg="white")

        self.controller = controller

        # ================= Title =================
        tk.Label(
            self,
            text="Create Account",
            font=("Helvetica", 24, "bold"),
            bg="white"
        ).pack(pady=20)

        # ================= Form =================

        tk.Label(self, text="Full Name", bg="white").pack()
        self.name = ttk.Entry(self, width=35)
        self.name.pack(pady=5)

        tk.Label(self, text="Email", bg="white").pack()
        self.email = ttk.Entry(self, width=35)
        self.email.pack(pady=5)

        tk.Label(self, text="Password", bg="white").pack()
        self.password = ttk.Entry(self, width=35, show="*")
        self.password.pack(pady=5)

        tk.Label(self, text="Confirm Password", bg="white").pack()
        self.confirm_password = ttk.Entry(self, width=35, show="*")
        self.confirm_password.pack(pady=5)

        tk.Label(self, text="Institution", bg="white").pack()
        self.institution = ttk.Entry(self, width=35)
        self.institution.pack(pady=5)

        tk.Label(self, text="Role", bg="white").pack()

        self.role = ttk.Combobox(
            self,
            values=[
                "Researcher",
                "Institution Admin",
                "Reviewer",
                "System Admin"
            ],
            state="readonly",
            width=32
        )

        self.role.current(0)
        self.role.pack(pady=10)

        # ================= Buttons =================

        ttk.Button(
            self,
            text="Create Account",
            command=self.signup
        ).pack(pady=15)

        ttk.Button(
            self,
            text="Back",
            command=lambda: controller.show_frame("LandingPage")
        ).pack()

    # ================= Signup Function =================

    def signup(self):

        if (
            self.name.get() == "" or
            self.email.get() == "" or
            self.password.get() == "" or
            self.confirm_password.get() == "" or
            self.institution.get() == ""
        ):
            messagebox.showerror(
                "Error",
                "Please fill in all fields."
            )
            return

        if self.password.get() != self.confirm_password.get():
            messagebox.showerror(
                "Error",
                "Passwords do not match."
            )
            return

        messagebox.showinfo(
            "Success",
            "Account created successfully!"
        )

        # Return to Login Page
        self.controller.show_frame("LoginPage")