
import os
from supabase import create_client, Client


def main():
    url: str = "https://vloluvdffwoittygfazy.supabase.co"
    key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsb2x1dmRmZndvaXR0eWdmYXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkyNTQ4NzksImV4cCI6MjAzNDgzMDg3OX0.69uc1XHqmHNy777xbLiiou-PuEvm9Rk1NBkdgfzaHlk"
    supabase: Client = create_client(url, key)

    # fetch data
    response = supabase.table("countries").select("*").execute()
    print(response)

    # insert data
    # response = (
    #     supabase.table("countries")
    #     .insert({"id": 1, "name": "Denmark"})
    #     .execute()
    # )


if __name__ == "__main__":
    main()
