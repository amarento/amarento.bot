import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "https://vloluvdffwoittygfazy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsb2x1dmRmZndvaXR0eWdmYXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkyNTQ4NzksImV4cCI6MjAzNDgzMDg3OX0.69uc1XHqmHNy777xbLiiou-PuEvm9Rk1NBkdgfzaHlk"
);
