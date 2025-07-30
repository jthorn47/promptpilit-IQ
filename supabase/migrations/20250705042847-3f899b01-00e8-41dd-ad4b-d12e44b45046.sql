UPDATE course_packages 
SET description = CASE 
  WHEN name = 'Easy' THEN 'Essential workplace safety'
  WHEN name = 'Easier' THEN 'Comprehensive safety training' 
  WHEN name = 'Easiest' THEN 'Complete safety solution'
  ELSE description
END
WHERE name IN ('Easy', 'Easier', 'Easiest');