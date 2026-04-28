import React from 'react';

function TreasurersReport({ selectedYear }) {
  if (selectedYear !== '2024/25') {
    return <article className="statement-card min-h-[260px] p-6 md:p-8" />;
  }

  return (
    <article className="statement-card p-6 leading-relaxed text-slate-700 dark:text-slate-300 md:p-8">
      <div className="mb-6">
        <h2 className="mt-1 font-brand text-2xl text-slate-950 dark:text-white">Treasurer's Report</h2>
      </div>

      <ol className="ml-6 list-decimal space-y-4 text-sm sm:text-base">
        <li>
          The club underwent a period of transition, appointing a new President, Treasurer and Head Coach.
        </li>
        <li>
          Coming off a strong financial performance last year (profit of $5,098.92), the club experienced a loss of <span className="font-semibold text-rose-600 dark:text-rose-400">$10,295</span> in the 2024/25 season.
        </li>
        <li>
          The club started the season with an opening bank balance of $52,067, and after a net movement of -$10,295, finished the season with a balance of $41,772.
        </li>
        <li>
          Although poor in many respects, it should be noted that we had budgeted for a loss of <span className="font-semibold text-rose-600 dark:text-rose-400">$7,750</span>. The original planned loss was primarily due to:
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              The club agreeing to take on the full financial burden of uniforms, costing upwards of $11,000, as a one-off expense rather than requiring players to purchase them directly.
            </li>
            <li>
              Increased financial obligation on player payments, most notably the head coach, flights, and accommodation for international players.
            </li>
          </ul>
        </li>
        <li>
          There were several contributing factors resulting in the club under-performing against budget and last year:
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Lack of Council support and grants, a reduction of $2.5k against budget and last year.</li>
            <li>
              A delay of $2.5k in key sponsor payments. This is not a drop in sponsor revenue, but is delayed and still planned for.
            </li>
            <li>
              A further $2.5k reduction in sponsor payments above and beyond the delayed amount, which is genuinely lost revenue and is unlikely to come in future periods.
            </li>
            <li>Reduction in bar profit against budget and last year.</li>
            <li>Player payments exceeding budget by $3.5k.</li>
            <li>Renovations to clubrooms exceeding budget by $1.3k.</li>
            <li>Reduced player subscriptions due to fill-ins and juniors playing seniors to help make up numbers.</li>
          </ul>
        </li>
        <li>
          Key areas of financial success include:
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              The Reverse Raffle, which generated profit of <span className="font-semibold text-emerald-600 dark:text-emerald-400">$6.7k</span> and continues to be the club's biggest revenue-driving item outside player subscriptions.
            </li>
            <li>
              A substantial reduction in ground hire fees as a result of dropping Wilsons Road Reserve as the secondary home ground and switching the 3rd XI to B Synthetic grade from F-Turf.
            </li>
          </ul>
        </li>
        <li>
          Areas for improvement:
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Increasing the revenue base through sponsorships remains the number one financial priority.</li>
            <li>Clear strategy around paid international players and coaches, ensuring player payments align to the club's revenue base and grade of competition.</li>
            <li>A greater push to tighten expenditure on bar and food, with a target of improving bar-taking profitability.</li>
          </ul>
        </li>
        <li>
          The club remains in a strong financial position, noting that the one-off uniforms expense and substantial increase in player payments explain much of the negative result. To grow and invest, the club will need a stronger push to increase sponsorships and broaden its revenue base.
        </li>
      </ol>
    </article>
  );
}

export default TreasurersReport;
