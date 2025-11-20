/*
 * Database Migration: Extend session token columns
 *
 * Some JWT access/refresh tokens can exceed 255 characters when payloads
 * and signatures are stored. Change session_token and refresh_token to TEXT
 * to avoid runtime insertion errors like "value too long for type character varying(255)".
 */

ALTER TABLE clinician_sessions
  ALTER COLUMN session_token TYPE TEXT,
  ALTER COLUMN refresh_token TYPE TEXT;

-- Indexes can remain the same; TEXT columns can still be indexed.