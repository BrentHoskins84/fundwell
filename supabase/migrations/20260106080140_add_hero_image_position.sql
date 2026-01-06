-- Add hero image position column to contests table
ALTER TABLE contests 
ADD COLUMN hero_image_position TEXT NOT NULL DEFAULT 'center'
CHECK (hero_image_position IN (
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right'
));

