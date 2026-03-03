-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ROLES & ENUMS
create type transaction_status as enum ('pending', 'succeeded', 'failed', 'refunded');
create type transaction_type as enum ('payment', 'commission', 'payout');
create type ledger_entry_type as enum ('credit', 'debit');

-- 1. PROVIDERS (Perfiles de Vendedores)
create table public.providers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  business_name text not null,
  contact_email text not null,
  
  -- Cybersource configuration
  cybersource_merchant_id text, -- ID público del merchant
  is_verified boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  unique(user_id)
);

-- 2. PROVIDER SECRETS (Credenciales encriptadas - RLS estricto)
-- Solo accesible por Edge Functions (service_role)
create table public.provider_credentials (
  provider_id uuid references public.providers(id) primary key,
  encrypted_api_key text not null,
  encrypted_api_secret text not null,
  key_id text, -- Identificador de la llave en Cybersource
  
  updated_at timestamptz default now()
);

-- 3. ORDERS (La compra del usuario)
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references auth.users, -- Puede ser null si es guest
  provider_id uuid references public.providers(id) not null,
  
  total_amount numeric(10,2) not null,
  currency text default 'USD',
  status text default 'created', -- created, paid, fulfilled, cancelled
  
  metadata jsonb,
  created_at timestamptz default now()
);

-- 4. TRANSACTIONS (Intentos de cobro en Gateway)
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id),
  provider_id uuid references public.providers(id),
  
  gateway_transaction_id text, -- ID devuelto por Cybersource
  amount numeric(10,2) not null,
  currency text default 'USD',
  
  status transaction_status default 'pending',
  type transaction_type default 'payment',
  
  gateway_response jsonb, -- Respuesta cruda del gateway para auditoría
  created_at timestamptz default now()
);

-- 5. LEDGER (Libro Mayor - La verdad financiera)
-- Registra cuánto debe el proveedor a la plataforma (comisiones)
create table public.ledger (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references public.providers(id) not null,
  transaction_id uuid references public.transactions(id), -- Link a la tx que originó esto
  
  description text not null,
  amount numeric(10,2) not null, -- Positivo = Deuda del proveedor (Commission), Negativo = Pago del proveedor
  entry_type ledger_entry_type not null,
  
  balance_after numeric(10,2) not null, -- Snapshot del balance
  created_at timestamptz default now()
);

-- RLS POLICIES (Básico)
alter table public.providers enable row level security;
alter table public.provider_credentials enable row level security;
alter table public.orders enable row level security;
alter table public.transactions enable row level security;
alter table public.ledger enable row level security;

-- Solo el dueño puede ver su perfil
create policy "Users can view own provider profile" on public.providers
  for select using (auth.uid() = user_id);

-- Nadie puede ver credenciales via API Client (solo Service Role)
create policy "No access to credentials" on public.provider_credentials
  for all using (false);

-- Users ven sus ordenes
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = customer_id);

-- INDEXES
create index idx_orders_provider on public.orders(provider_id);
create index idx_transactions_order on public.transactions(order_id);
create index idx_ledger_provider on public.ledger(provider_id);
