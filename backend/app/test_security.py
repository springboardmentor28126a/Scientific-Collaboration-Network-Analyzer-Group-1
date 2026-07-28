from app.core.security import hash_password
from app.core.security import verify_password


password = "Scientific123"

hashed = hash_password(password)

print("Original Password:")
print(password)

print("\nHashed Password:")
print(hashed)

print("\nVerification:")
print(
    verify_password(
        password,
        hashed
    )
)