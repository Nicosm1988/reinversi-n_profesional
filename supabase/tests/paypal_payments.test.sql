-- Run in a transaction after applying the migration to an isolated/local DB.
-- The runner must roll back. No real users or payments are retained.
insert into auth.users(id) values ('01000000-0000-0000-0000-000000000001'), ('01000000-0000-0000-0000-000000000002');
set local role service_role;
insert into public.paypal_payments(id,user_id,service,environment,amount,external_id) values
('02000000-0000-0000-0000-000000000001','01000000-0000-0000-0000-000000000001','orientacion-vocacional','sandbox',450,'SANDBOX_TEST_ORDER'),
('02000000-0000-0000-0000-000000000002','01000000-0000-0000-0000-000000000002','transiciones-laborales','sandbox',850,'SANDBOX_TEST_OTHER');
select public.record_paypal_event('TEST_EVENT','02000000-0000-0000-0000-000000000001','approved','TEST_CAPTURE');
select public.record_paypal_event('TEST_EVENT','02000000-0000-0000-0000-000000000001','approved','TEST_CAPTURE');
select public.record_paypal_event('TEST_LATE_PENDING','02000000-0000-0000-0000-000000000001','pending',null);
do $$ begin
  if (select count(*) from public.paypal_webhook_events where webhook_event_id='TEST_EVENT') <> 1 then raise exception 'Duplicate event'; end if;
  if (select status from public.paypal_payments where external_id='SANDBOX_TEST_ORDER') <> 'approved' then raise exception 'Approval lost'; end if;
  begin
    insert into public.paypal_payments(user_id,service,environment,amount,external_id) values ('01000000-0000-0000-0000-000000000001','transiciones-laborales','sandbox',850,'SANDBOX_TEST_ORDER');
    raise exception 'Duplicate provider order accepted';
  exception when unique_violation then null; end;
  begin
    insert into public.paypal_payments(user_id,service,environment,amount) values ('01000000-0000-0000-0000-000000000001','orientacion-vocacional','sandbox',450);
    raise exception 'Duplicate enrollment accepted';
  exception when unique_violation then null; end;
end $$;
select public.record_paypal_event('TEST_REFUND','02000000-0000-0000-0000-000000000001','refunded','TEST_CAPTURE');
select public.record_paypal_event('TEST_STALE_COMPLETED','02000000-0000-0000-0000-000000000001','approved','TEST_CAPTURE');
do $$ begin
  if (select status from public.paypal_payments where external_id='SANDBOX_TEST_ORDER') <> 'refunded' then raise exception 'Refund reactivated'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','01000000-0000-0000-0000-000000000001',true);
do $$ begin
  if (select count(*) from public.paypal_payments) <> 1 then raise exception 'RLS leak'; end if;
  begin
    update public.paypal_payments set status='approved'; raise exception 'Client may approve payments';
  exception when insufficient_privilege then null; end;
  begin
    perform public.record_paypal_event('FORGED','02000000-0000-0000-0000-000000000001','approved','TEST_CAPTURE'); raise exception 'Client may forge webhook';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from public.paypal_webhook_events; raise exception 'Webhook data exposed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin perform 1 from public.paypal_payments; raise exception 'Anonymous access';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
