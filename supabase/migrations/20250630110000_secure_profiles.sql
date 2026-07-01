-- Prevent clients from setting is_author or storage_bytes_used on their own profile.
-- Privilege escalation and storage-quota bypass both went through profiles_update_own.

REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM anon;

GRANT UPDATE (display_name) ON public.profiles TO authenticated;

-- Belt-and-suspenders: block protected-column writes from API roles even if grants change.
CREATE OR REPLACE FUNCTION public.protect_profile_system_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.is_author IS DISTINCT FROM OLD.is_author
       OR NEW.storage_bytes_used IS DISTINCT FROM OLD.storage_bytes_used
       OR NEW.id IS DISTINCT FROM OLD.id
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Cannot modify protected profile fields'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_system_columns ON public.profiles;

CREATE TRIGGER profiles_protect_system_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_system_columns();
