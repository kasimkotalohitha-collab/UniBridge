import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://imkwtekrtdhixamhoyto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlta3d0ZWtydGRoaXhhbWhveXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NTU3MjcsImV4cCI6MjEwNDQzMTcyN30.vMl-g6t1q3gt-3ieidZB0DiRTYwMHrSh4wv98tROKmw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTestSignup() {
  const timestamp = Date.now();
  const testEmail = `student_${timestamp}@campus.edu`;
  
  console.log(`[TEST] Attempting test student signup with: ${testEmail}`);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test Campus Student',
        role: 'student',
        student_id_number: '2024-CS-999',
        phone: '9876543210'
      }
    }
  });

  if (error) {
    console.error(`[FAIL] SignUp failed:`, error.message, `(Status: ${error.status})`);
    return false;
  }

  console.log(`[SUCCESS] User created successfully! Auth ID: ${data.user?.id}`);

  // Check if profile was automatically created by the trigger
  if (data.user?.id) {
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profErr) {
      console.log(`[NOTE] Profile select note (RLS): ${profErr.message}`);
    } else if (profile) {
      console.log(`[SUCCESS] Profile verified in database:`, profile);
    }
  }

  return true;
}

runTestSignup();
