-- Fix functions that should be VOLATILE but are currently STABLE

-- log_company_creation function likely performs INSERT operations for audit logging
ALTER FUNCTION public.log_company_creation() VOLATILE;

-- check_duplicate_company_client might be called in contexts that need INSERT operations  
ALTER FUNCTION public.check_duplicate_company_client(text, text) VOLATILE;

-- find_potential_duplicates might be involved in creation processes
ALTER FUNCTION public.find_potential_duplicates(text, text) VOLATILE;

-- normalize_company_name might be called during company creation with logging
ALTER FUNCTION public.normalize_company_name(text) VOLATILE;

-- validate_lifecycle_stage might be called during validation with logging
ALTER FUNCTION public.validate_lifecycle_stage(text) VOLATILE;