import React from 'react';

function KeyRevenueItems({ selectedYear }) {
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

function Section({ title, children }) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="mb-2 font-brand text-lg text-slate-950 dark:text-white">{title}</h3>
      <div className="text-sm sm:text-base">{children}</div>
    </section>
  );
}

export default KeyRevenueItems;
