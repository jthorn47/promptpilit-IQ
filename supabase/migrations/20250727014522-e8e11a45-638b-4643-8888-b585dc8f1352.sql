-- Create the trigger for company to client conversion
DROP TRIGGER IF EXISTS company_to_client_conversion_trigger ON company_settings;

CREATE TRIGGER company_to_client_conversion_trigger
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION handle_company_to_client_conversion();