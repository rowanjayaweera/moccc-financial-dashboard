import React from 'react';

function KeyExpenseItems({ selectedYear }) {
  if (selectedYear === '2025/26') {
    return <KeyExpenseItems202526 />;
  }

  if (selectedYear !== '2024/25') {
    return <article className="statement-card min-h-[260px] p-6 md:p-8" />;
  }

  return (
    <article className="statement-card p-6 leading-relaxed text-slate-700 dark:text-slate-300 md:p-8">
      <div className="mb-6">
        <p className="eyebrow">Expense commentary</p>
        <h2 className="mt-1 font-brand text-2xl text-slate-950 dark:text-white">Key Expense Lines</h2>
      </div>

      <Section title="Player Payments">
        <ol className="ml-6 list-decimal space-y-2">
          <li>
            Payments were made:
            <ul className="mt-1 ml-6 list-disc space-y-1">
              <li>To the coach in the sum of <span className="font-semibold">$9,000</span>.</li>
              <li>To the captain in the sum of <span className="font-semibold">$2,000</span>.</li>
              <li>Other player payments in the sum of <span className="font-semibold">$4,532</span>.</li>
              <li>Overseas player payment on-costs of <span className="font-semibold">$12,418</span>.</li>
            </ul>
          </li>
          <li>Budget was exceeded in relation to flights and accommodation costs, being $2.7k more than planned.</li>
          <li>Securing and guaranteeing employment for overseas players continues to be a challenge and resulted in further club support.</li>
          <li>The club will review player payment expenditure so it better aligns with the revenue base, playing list, and grade of competition.</li>
        </ol>
      </Section>

      <Section title="Equipment, Uniforms and Training">
        <ol className="ml-6 list-decimal space-y-2">
          <li>
            Equipment, training expenses, and uniforms remained in line with budget, noting the planned increase in uniforms expenditure this year.
          </li>
          <li>Cricket balls, a considerable expense to the club at $8.3k, remained in line with budget and consistent with last year.</li>
        </ol>
      </Section>

      <Section title="Game Day and Affiliation Fees">
        <ol className="ml-6 list-decimal space-y-2">
          <li>The club saved substantial cost on ground hire as a result of dropping Wilsons Road Reserve as the secondary home ground.</li>
          <li>Umpire fees ran slightly under budget, with only one senior team making finals.</li>
          <li>Affiliation fees remained consistent with last year.</li>
          <li>
            Afternoon teas were a success for the club, but financially ran at a loss. Further thought is needed on collecting afternoon tea money on game day or as part of subscription fees.
          </li>
        </ol>
      </Section>

      <Section title="Other">
        <ol className="ml-6 list-decimal space-y-2">
          <li>Trophies and recognition costs were reduced by repurposing unused stock from last year.</li>
          <li>The clubroom renovation used Bunnings flatpacks, additional cabinets, and associated labour, costing just over $3k and coming in slightly over budget.</li>
        </ol>
      </Section>
    </article>
  );
}

function KeyExpenseItems202526() {
  return (
    <article className="statement-card p-6 leading-relaxed text-slate-700 dark:text-slate-300 md:p-8">
      <div className="mb-6">
        <p className="eyebrow">Expense commentary</p>
        <h2 className="mt-1 font-brand text-2xl text-slate-950 dark:text-white">Key Expense Lines</h2>
      </div>

      <Section title="Overall Expenses">
        <p>
          Total expenses finished at <span className="font-semibold">$71,433</span>, which was{' '}
          <span className="font-semibold">$18,674</span> lower than last year and{' '}
          <span className="font-semibold">$14,069</span> below budget.
        </p>
      </Section>

      <Section title="Player Payments">
        <p>
          Player payments were the largest favourable movement compared with last year. Spend reduced to{' '}
          <span className="font-semibold">$16,536</span>, down from <span className="font-semibold">$29,566</span> last year. Given the
          club's on-field success, particularly the 1st XI premiership, this represented strong value for the level of investment.
        </p>
        <p className="mt-2">
          Looking at our bottom line, cost base, and the number of teams and players we can field, this level of investment is about what
          the club can manage in the near future unless sponsorship revenue grows or we are successful with grants.
        </p>
      </Section>

      <Section title="Equipment, Uniforms and Training">
        <p>
          Equipment, uniforms and training costs were also lower year on year, finishing at{' '}
          <span className="font-semibold">$15,757</span> compared with <span className="font-semibold">$24,571</span> last year. The main
          driver was uniforms, with last year including a larger senior uniform order.
        </p>
        <p className="mt-2">
          Because we report on a cash basis, we absorb those costs fully in the year they occur, and this year benefited from that prior-year
          spend not repeating.
        </p>
      </Section>

      <Section title="Functions, Bar and Food">
        <p>
          Functions, bar and food expenses increased year on year, mainly due to higher bar activity and higher input costs. While bar
          revenue increased, the extra revenue did not flow through to a materially higher profit because the cost base increased at the same
          time.
        </p>
      </Section>

      <Section title="Game Day and Affiliation Fees">
        <p>
          Game day and affiliation costs were broadly consistent with last year and came in below budget.
        </p>
      </Section>

      <Section title="Looking Ahead">
        <p>
          The overall expense result was well managed, but there is not much fat left to cut. The path to a stronger result runs through
          revenue, not expenses. Sponsorship and grants remain the clearest opportunities to improve that position.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="mb-2 font-brand text-lg text-slate-950 dark:text-white">{title}</h3>
      <div className="text-sm sm:text-base">{children}</div>
    </section>
  );
}

export default KeyExpenseItems;
