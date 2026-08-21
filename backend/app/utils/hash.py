import hashlib

def hash_password(password: str) -> str:
    # Basic robust SHA-256 password hashing with a custom salt to secure credentials
    salt = "scinexus_secure_salt_2026"
    salted_pass = f"{password}{salt}"
    return hashlib.sha256(salted_pass.encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password
