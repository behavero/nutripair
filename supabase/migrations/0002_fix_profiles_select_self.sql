-- ============================================================================
-- Fix: invite-accept could not move a profile to the inviter's household.
--
-- Symptom: after B accepted A's invite, B.household_id stayed unchanged, so the
-- members list (and avatar pair) only ever showed one person.
--
-- Cause: the profile UPDATE (PATCH profiles SET household_id = <inviter>) was
-- rejected with 42501 "new row violates row-level security policy". Postgres
-- enforces the SELECT policy against the POST-update row, and the original
-- profiles_select (household_id = auth_household_id()) failed because
-- auth_household_id() is STABLE and still resolved to B's OLD household on the
-- transaction snapshot. So the moved row was "invisible" → update blocked.
--
-- Fix: let a user always see their OWN profile row (id = auth.uid()) in addition
-- to household peers. The moved row then stays visible to its owner, the update
-- succeeds, and household members still see each other via the household clause.
-- ============================================================================
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select
  using (household_id = auth_household_id() or id = auth.uid());
