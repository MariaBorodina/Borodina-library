-- Extensions and enum types for the Fictioneers library MVP

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.book_status AS ENUM ('draft', 'published');
CREATE TYPE public.increment_file_format AS ENUM ('epub', 'pdf', 'txt');
