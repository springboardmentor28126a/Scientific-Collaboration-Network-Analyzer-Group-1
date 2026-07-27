import sys

sys.path.append("src")



from middleware.auth import verify_password



hashed = "$2b$12$5rsdGdHSOhja2L5KnQzP1.7ToQgUvgIem/uCmg7N/HQsQOH6xk5sK"



print(verify_password("ssm123", hashed)) 
						
