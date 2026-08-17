-- Elimina el esquema de un producto anterior ("direct to provider"), reemplazado
-- por el modelo actual de Senda (profiles / initial_diagnostics / user_diagnostics /
-- lead_requests). Confirmado sin filas y sin referencias en el código de la app
-- antes de este cambio.
drop table if exists public.diagnostic_results cascade;
drop table if exists public.diagnostic_sessions cascade;
drop table if exists public.diagnostics cascade;
drop table if exists public.applications cascade;
drop table if exists public.orders cascade;
drop table if exists public.transactions cascade;
drop table if exists public.ledger cascade;
drop table if exists public.provider_credentials cascade;
drop table if exists public.providers cascade;
