DO $do$
BEGIN
  -- 1. Create Schema
  CREATE SCHEMA IF NOT EXISTS crm;
  GRANT USAGE ON SCHEMA crm TO public, anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA crm GRANT ALL ON TABLES TO public, anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA crm GRANT ALL ON FUNCTIONS TO public, anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA crm GRANT ALL ON SEQUENCES TO public, anon, authenticated, service_role;

  -- 2. Backups and Migration for 13 tables

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contacts') THEN
    CREATE TABLE IF NOT EXISTS public.backup_contacts AS SELECT * FROM public.contacts;
    ALTER TABLE public.contacts SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_interactions') THEN
    CREATE TABLE IF NOT EXISTS public.backup_crm_interactions AS SELECT * FROM public.crm_interactions;
    ALTER TABLE public.crm_interactions SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotations') THEN
    CREATE TABLE IF NOT EXISTS public.backup_quotations AS SELECT * FROM public.quotations;
    ALTER TABLE public.quotations SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'policies') THEN
    CREATE TABLE IF NOT EXISTS public.backup_policies AS SELECT * FROM public.policies;
    ALTER TABLE public.policies SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'internal_messages') THEN
    CREATE TABLE IF NOT EXISTS public.backup_internal_messages AS SELECT * FROM public.internal_messages;
    ALTER TABLE public.internal_messages SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
    CREATE TABLE IF NOT EXISTS public.backup_documents AS SELECT * FROM public.documents;
    ALTER TABLE public.documents SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_log') THEN
    CREATE TABLE IF NOT EXISTS public.backup_audit_log AS SELECT * FROM public.audit_log;
    ALTER TABLE public.audit_log SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vendor_config') THEN
    CREATE TABLE IF NOT EXISTS public.backup_vendor_config AS SELECT * FROM public.vendor_config;
    ALTER TABLE public.vendor_config SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'app_notifications') THEN
    CREATE TABLE IF NOT EXISTS public.backup_app_notifications AS SELECT * FROM public.app_notifications;
    ALTER TABLE public.app_notifications SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'training_progress') THEN
    CREATE TABLE IF NOT EXISTS public.backup_training_progress AS SELECT * FROM public.training_progress;
    ALTER TABLE public.training_progress SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'forum_posts') THEN
    CREATE TABLE IF NOT EXISTS public.backup_forum_posts AS SELECT * FROM public.forum_posts;
    ALTER TABLE public.forum_posts SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'forum_replies') THEN
    CREATE TABLE IF NOT EXISTS public.backup_forum_replies AS SELECT * FROM public.forum_replies;
    ALTER TABLE public.forum_replies SET SCHEMA crm;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'manual_feedback') THEN
    CREATE TABLE IF NOT EXISTS public.backup_manual_feedback AS SELECT * FROM public.manual_feedback;
    ALTER TABLE public.manual_feedback SET SCHEMA crm;
  END IF;

END $do$;
