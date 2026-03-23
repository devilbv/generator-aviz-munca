import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ohrwunaegzppaylugbcj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocnd1bmFlZ3pwcGF5bHVnYmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzcxNDUsImV4cCI6MjA4OTg1MzE0NX0.rtpp_Q1WTtxJIjzaqftwSIFMBwZpxd9jiUO6qwzVTck'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'implicit',
  },
})
