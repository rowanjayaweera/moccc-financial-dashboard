import React from 'react';

function KeyRevenueItems({ selectedYear }) {
  if (selectedYear === '2025/26') {
    return <KeyRevenueItems202526 />;
  }

  if (selectedYear !== '2024/25') {
    return <article className="statement-card min-h-[260px] p-6 md:p-8" />;
  }

  return (
    <article className="statement-card p-6 leading-relaxed text-slate-700 dark:text-slate-300 md:p-8">
      <div className="mb-6">
        <p className="eyebrow">Revenue commentary</p>
        <h2 className="mt-1 font-brand text-2xl text-slate-950 dark:text-white">Key Revenue Lines</h2>
      </div>

      <Section title="Sponsorships">
        <ol className="ml-6 list-decimal space-y-2">
          <li>The college continues to be the club's major sponsor for the 2024/25 season.</li>
          <li>Sponsorships continue to be a challenge and remain a key focus area for the club moving forward.</li>
          <li>
            The club thanks the following for their ongoing support and commitment:
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Mazenod College</li>
              <li>Mazenod Old Collegians Association</li>
              <li>Acrylico</li>
              <li>Bowery Capital</li>
              <li>Mulgrave Country Club</li>
              <li>Alby's Lawnmowing Service</li>
              <li>Weatherware Protection</li>
            </ul>
          </li>
        </ol>
      </Section>

      <Section title="Subscription Fees">
        <p>
          Subscriptions were down on last season, owing to a large number of fill-ins and juniors playing as seniors for the 2024/25 season.
          The club remains committed to providing appropriate and affordable subscription fees and continues to benchmark fees across other cricket clubs.
        </p>
      </Section>

      <Section title="Social Functions">
        <ol className="ml-6 list-decimal space-y-2">
          <li>
            This season, the club hosted several functions intended to promote, include, and celebrate the history and success of the club:
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Reverse Raffle, which made profit upwards of <span className="font-semibold text-emerald-600 dark:text-emerald-400">$6.7k</span> and proved very successful.</li>
              <li>Ladies Day</li>
              <li>KD Club function</li>
              <li>Australia Day T20 game</li>
              <li>Presentation Night, which was not intended to be a profit-making event.</li>
            </ul>
          </li>
          <li>A thank you to all involved in organizing and running these functions.</li>
        </ol>
      </Section>

      <Section title="Bar and Food">
        <p>
          The bar underperformed against budget and previous years. This is an area to review moving forward. The club manages drink purchases efficiently, but markups need an overhaul to accommodate cost increases from recent seasons.
        </p>
      </Section>
    </article>
  );
}

function KeyRevenueItems202526() {
  return (
    <article className="statement-card p-6 leading-relaxed text-slate-700 dark:text-slate-300 md:p-8">
      <div className="mb-6">
        <p className="eyebrow">Revenue commentary</p>
        <h2 className="mt-1 font-brand text-2xl text-slate-950 dark:text-white">Key Revenue Lines</h2>
      </div>

      <Section title="Overall Revenue">
        <p>
          Total revenue finished at <span className="font-semibold">$73,137</span>, which was{' '}
          <span className="font-semibold">$6,675</span> lower than last year and{' '}
          <span className="font-semibold">$16,663</span> below budget.
        </p>
      </Section>

      <Section title="Sponsors, Grants and Memberships">
        <p>
          The biggest pressure point was sponsors, grants and memberships, which finished at{' '}
          <span className="font-semibold">$10,742</span> compared with <span className="font-semibold">$17,000</span> last year. This
          reflects the loss of some existing sponsor support and MOCA being unable to provide its usual contribution. New sponsorships
          helped reduce the impact, but did not fully replace what was lost.
        </p>
        <p className="mt-2">
          Thanks to Matt Quinn's work across the season, the club was able to bring in new sponsorship support and soften what would
          otherwise have been a larger shortfall.
        </p>
      </Section>

      <Section title="Functions and Events">
        <p>
          Functions, bar and food generated <span className="font-semibold">$31,031</span> in revenue. Function profits were important this
          year, with the Reverse Raffle, Ladies Day, Christmas Breakup, Presentation Night and the darts tournament all contributing. These
          events made a genuine difference to the final result.
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Reverse Raffle: just under $6,000 profit.</li>
          <li>Ladies Day: just under $800 profit.</li>
          <li>Christmas Breakup: around $500 profit.</li>
          <li>Presentation Night: around $700 profit.</li>
          <li>Darts tournament: a smaller contribution, but still helpful to the bottom line.</li>
        </ul>
      </Section>

      <Section title="Subscriptions">
        <p>
          Subscriptions finished at <span className="font-semibold">$27,994</span>, slightly below last year and below budget. The junior
          program remains the strongest long-term positive in this area and continues to be a major driver of subscription revenue.
        </p>
      </Section>

      <Section title="Bar and Food">
        <p>
          Bar takings increased compared with last year, which is a positive sign for engagement around the club. However, the profit on
          the bar remained broadly flat at just over <span className="font-semibold">$2,500</span>, because the increased takings were
          matched by increased costs. Bar prices were increased during the year, but this was largely to absorb cost increases rather than
          improve margin.
        </p>
      </Section>

      <Section title="Other Revenue">
        <p>
          Other revenue was helped by uniform-related income, including the hoodie order, which added around{' '}
          <span className="font-semibold">$600</span> in profit.
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

export default KeyRevenueItems;
