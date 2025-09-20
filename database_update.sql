-- Database Schema Update for OTP Flow
-- Run these commands in your MySQL database

-- Add OTP fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6) NULL,
ADD COLUMN IF NOT EXISTS otp_expires_at DATETIME NULL;

-- Make password nullable (since it's set after OTP verification)
ALTER TABLE users 
MODIFY COLUMN password VARCHAR(255) NULL;

-- Update existing users to be verified (if they have passwords)
UPDATE users 
SET is_verified = 1 
WHERE password IS NOT NULL;

-- Verify the schema
DESCRIBE users;
