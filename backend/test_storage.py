from services.storage import supabase

print(
    supabase.storage.list_buckets()
)