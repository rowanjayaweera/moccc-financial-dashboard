import React from 'react';

function KeyExpenseItems({ selectedYear }) {
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

function Section({ title, children }) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="mb-2 font-brand text-lg text-slate-950 dark:text-white">{title}</h3>
      <div className="text-sm sm:text-base">{children}</div>
    </section>
  );
}

export default KeyExpenseItems;
