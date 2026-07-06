from app.core.security import create_access_token

token = create_access_token(
    {
        "sub": "sravani1406"
    }
)

print("Generated JWT Token:\n")
print(token)