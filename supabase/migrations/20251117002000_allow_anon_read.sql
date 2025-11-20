-- Allow anon users to read flight data (for dashboard viewing)
create policy "Anon users can read all flights"
on "public"."drone_flights"
as permissive
for select
to anon
using (true);
