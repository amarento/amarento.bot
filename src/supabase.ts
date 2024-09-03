import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { Database } from "./database.types";
dotenv.config();

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

// Create a single supabase client for interacting with your database
if (SUPABASE_URL === undefined || SUPABASE_KEY === undefined) {
  throw new Error("Supabase credentials are not defined");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);
