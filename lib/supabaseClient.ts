import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://irdetemffowpsyyytnek.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZGV0ZW1mZm93cHN5eXl0bmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMDY1MTcsImV4cCI6MjA3Mjg4MjUxN30.FSskz3BxLEkU_UEbN_6cKWTaZhiOMHN_6j_giEMg3AM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)