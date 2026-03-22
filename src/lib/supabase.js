import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oglsomxflooiprbzqwfq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbHNvbXhmbG9vaXByYnpxd2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTg0NzcsImV4cCI6MjA3Njg3NDQ3N30.WQctiKGDx1sGFJN1-mpVS_VmJdGdTsNFPmBS7Lj11iU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'implicit',
  },
})
