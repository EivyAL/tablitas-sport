import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fihmwkoetdqvnzluvzdo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaG13a29ldGRxdm56bHV2emRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDExODksImV4cCI6MjA5NTMxNzE4OX0.4Q01SZKfypTcYiNh-LNU_hJaSaSmQ92lyUHOAT1xU4w'

export const supabase = createClient(supabaseUrl, supabaseKey)