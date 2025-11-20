import { redirect } from 'next/navigation';
import { createSSRSassClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabaseClient = await createSSRSassClient();

  const { data: { user } } = await supabaseClient.getSupabaseClient().auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/app');
  }

  // If not logged in, redirect to login page
  redirect('/auth/login');
}
