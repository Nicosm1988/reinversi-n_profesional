-- Incremental, independent payment records. No change to diagnostics or auth.
create table public.paypal_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  service text not null check (service in ('orientacion-vocacional', 'transiciones-laborales')),
  environment text not null check (environment in ('sandbox', 'live')),
  provider text not null default 'paypal' check (provider = 'paypal'),
  external_id text,
  capture_id text,
  merchant_id text,
  amount numeric(9,2) not null check (amount > 0),
  currency text not null default 'USD' check (currency = 'USD'),
  status text not null default 'created' check (status in ('created', 'pending', 'approved', 'failed', 'refunded', 'reversed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  unique (provider, external_id),
  unique (provider, capture_id),
  -- One enrollment per service; all browser retries reuse the same enrollment.
  unique (user_id, service, environment)
);
create table public.paypal_webhook_events (
  webhook_event_id text primary key,
  payment_id uuid not null references public.paypal_payments(id) on delete restrict,
  processed_at timestamptz not null default now()
);
create index paypal_webhook_payment_idx on public.paypal_webhook_events(payment_id);
alter table public.paypal_payments enable row level security;
alter table public.paypal_webhook_events enable row level security;
revoke all on public.paypal_payments, public.paypal_webhook_events from public, anon, authenticated;
grant select on public.paypal_payments to authenticated;
grant select, insert, update on public.paypal_payments to service_role;
grant select, insert on public.paypal_webhook_events to service_role;
create policy own_paypal_payments on public.paypal_payments for select to authenticated
  using ((select auth.uid()) = user_id);

create function public.touch_paypal_payment() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;
revoke all on function public.touch_paypal_payment() from public, anon, authenticated;
create trigger paypal_payment_updated before update on public.paypal_payments
  for each row execute function public.touch_paypal_payment();

-- Called only after official signature + PayPal API reconciliation. Event
-- deduplication and service entitlement are committed in the same transaction.
create function public.record_paypal_event(p_event_id text, p_payment_id uuid, p_status text, p_capture_id text)
returns void language plpgsql security invoker set search_path = '' as $$
declare current_payment public.paypal_payments%rowtype;
begin
  if p_status is null or p_status not in ('pending', 'approved', 'failed', 'refunded', 'reversed') then
    raise exception 'Invalid payment state';
  end if;
  select * into strict current_payment from public.paypal_payments where id = p_payment_id for update;
  if p_status = 'approved' and p_capture_id is null then raise exception 'Capture required'; end if;
  if current_payment.capture_id is not null and p_capture_id is not null and current_payment.capture_id <> p_capture_id then
    raise exception 'Capture mismatch';
  end if;
  insert into public.paypal_webhook_events(webhook_event_id, payment_id) values (p_event_id, p_payment_id)
    on conflict (webhook_event_id) do nothing;
  if not found then return; end if;
  -- Late pending/failed events cannot undo approval; stale completion cannot
  -- reactivate a refunded or reversed enrollment.
  if current_payment.status in ('refunded', 'reversed') then return; end if;
  if current_payment.status = 'approved' and p_status in ('pending', 'failed') then return; end if;
  update public.paypal_payments set status = p_status,
    capture_id = coalesce(p_capture_id, capture_id),
    approved_at = case when p_status = 'approved' then coalesce(approved_at, now()) else approved_at end
    where id = p_payment_id;
end;
$$;
revoke all on function public.record_paypal_event(text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.record_paypal_event(text, uuid, text, text) to service_role;
comment on column public.paypal_payments.status is 'Only approved enables service coordination; never derived from browser return parameters.';
