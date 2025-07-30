-- Remove fake SBW-9237 from training modules catalog
DELETE FROM public.training_modules_catalog WHERE module_id = 'sbw_9237';