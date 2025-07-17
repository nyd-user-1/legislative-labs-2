
-- Add new id column as primary key
ALTER TABLE "Sample Problems" ADD COLUMN id SERIAL PRIMARY KEY;

-- Clean up special characters in text column
UPDATE "Sample Problems" SET "Sample Problems" = REPLACE(REPLACE("Sample Problems", '�', ''), chr(0), '');

-- Remove any duplicate entries if they exist
DELETE FROM "Sample Problems" a USING "Sample Problems" b 
WHERE a.ctid < b.ctid AND a."Sample Problems" = b."Sample Problems";
