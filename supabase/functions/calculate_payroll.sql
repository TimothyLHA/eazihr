-- Function: Calculate Payroll for an organization
create or replace function calculate_payroll(
  p_org_id uuid,
  p_month int,
  p_year int
)
returns void
language plpgsql
security definer
as $$
declare
  v_payroll_run_id uuid;
begin
  insert into payroll_runs (organization_id, month, year, status)
  values (p_org_id, p_month, p_year, 'processing')
  returning id into v_payroll_run_id;

  insert into payroll_items (payroll_run_id, employee_id, organization_id, basic_salary, overtime_amount, incentives_amount, deductions)
  select
    v_payroll_run_id,
    e.id,
    e.organization_id,
    e.basic_salary,
    coalesce(ot.total_overtime, 0),
    coalesce(inc.total_incentives, 0),
    coalesce(loan.total_deductions, 0)
  from employees e
  left join (
    select employee_id, sum(total_amount) as total_overtime
    from overtime_requests
    where status = 'approved'
    and extract(month from date) = p_month
    and extract(year from date) = p_year
    group by employee_id
  ) ot on ot.employee_id = e.id
  left join (
    select employee_id, sum(amount) as total_incentives
    from incentives
    where extract(month from date) = p_month
    and extract(year from date) = p_year
    group by employee_id
  ) inc on inc.employee_id = e.id
  left join (
    select employee_id, sum(monthly_emi) as total_deductions
    from loans
    where status = 'disbursed'
    group by employee_id
  ) loan on loan.employee_id = e.id
  where e.organization_id = p_org_id
  and e.status = 'active';

  update payroll_runs
  set status = 'completed', executed_at = now()
  where id = v_payroll_run_id;
end;
$$;
