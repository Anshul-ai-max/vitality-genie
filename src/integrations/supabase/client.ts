import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lzdrqolezmvbzrrfiuhl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cZ66pTyyTtZNVerk2Crm6A_JOjsDSSp";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
