import React from 'react';

function TreasurersReport({ selectedYear }) {
  if (selectedYear === '2025/26') {
    return <TreasurersReport202526 />;
  }

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

function TreasurersReport202526() {
  return (
    <article className="statement-card p-6 leading-relaxed text-slate-700 dark:text-slate-300 md:p-8">
      <div className="mb-6">
        <h2 className="mt-1 font-brand text-2xl text-slate-950 dark:text-white">Treasurer's Report</h2>
      </div>

      <div className="space-y-4 text-sm sm:text-base">
        <p>
          For the 2025/26 season, the club finished with a cash-basis profit of{' '}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">$1,704</span>.
        </p>
        <p>
          This is an improvement of almost <span className="font-semibold">$12,000</span> on last year's loss of{' '}
          <span className="font-semibold text-rose-600 dark:text-rose-400">$10,295</span>, although still{' '}
          <span className="font-semibold text-rose-600 dark:text-rose-400">$2,594</span> behind our budgeted profit of{' '}
          <span className="font-semibold">$4,298</span>.
        </p>
        <p>
          The headline though is what happened on the field for the senior sides. A 1st XI premiership, a 3rd XI and womens finals appearance
          is a great year by any measure, and the financial result needs to be read alongside that. We had on-field success and finished above
          breakeven. That's a good year for the club. That said, the bigger picture is one we've talked about for several years: even in a
          strong season, we only just clear breakeven. Until we grow the revenue base, that's the reality.
        </p>
        <p>
          Revenue finished at <span className="font-semibold">$73,137</span>, which was <span className="font-semibold">$6,675</span> lower
          than last year and <span className="font-semibold">$16,663</span> below budget. Expenses finished at{' '}
          <span className="font-semibold">$71,433</span>, which was <span className="font-semibold">$18,674</span> lower than last year and{' '}
          <span className="font-semibold">$14,069</span> below budget. In simple terms, revenue came under pressure, but we offset most of it
          by managing costs harder than budgeted.
        </p>
        <p>
          The club opened the year with <span className="font-semibold">$41,772</span> in the bank and ended with a closing bank balance of{' '}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">$43,476</span>. We did not materially grow the cash position,
          but we do retain a reasonable buffer to operate through tougher periods and, if the economic climate improves, to invest deliberately
          back into the club.
        </p>
        <p>
          The current economic landscape is a challenging one, not just for community clubs, but for businesses and supporters alike. This
          resulted in some of our most consistent supporters, such as MOCA, not being in a position to provide their usual contribution. We
          also lost part of our existing sponsor base from last year. Combined, that's around an <span className="font-semibold">$11,000</span>{' '}
          drop in sponsorship revenue year on year - a significant gap to absorb, and the main reason we came in below our budgeted profit.
          Through Matt Quinn's work bringing in new sponsorship support, we were able to reduce what would otherwise have been a much larger
          shortfall.
        </p>

        <p>
          I would like to thank our sponsors for their support: Bowery Capital, McLardy McShane, Win Real Estate, Wyllie Electrical Solutions,
          Weatherware Protection, Mulgrave Country Club and Transcal. Mazenod College also deserves specific acknowledgment for its continued
          in-kind support. Access to the College facilities and oval materially reduces our ground hire costs, and in practical terms makes
          the College one of the club's most important supporters.
        </p>

        <p>
          When finances are tight, the smaller wins matter. Our functions made an important contribution this year, with the Reverse Raffle
          making just under <span className="font-semibold">$6,000</span>, Ladies Day just under <span className="font-semibold">$800</span>,
          the Christmas Breakup around <span className="font-semibold">$500</span>, Presentation Night around{' '}
          <span className="font-semibold">$700</span>, and the darts tournament also adding to the bottom line. None of these items solve
          everything on their own, but together they helped keep us in the black. I would also like to thank Michael Riley and the committee
          for their work across the season.
        </p>
        <p>
          Club merchandise and our order of hoodies was another small win, with strong buy-in from members and more than 41 hoodies purchased,
          contributing around <span className="font-semibold">$600</span> in profit.
        </p>
        <p>
          Looking forward, sponsorship and grants remain the two biggest opportunities to grow the revenue base and invest further in the club.
          Player payments at current levels are about all we can sustain unless that revenue grows. The juniors program continues to go from
          strength to strength and is genuinely the most important long-term asset we have at the club, both as a subscription driver and as a
          future supporter and sponsorship pipeline. The path forward is revenue-led. Cost discipline will remain important, but there is not
          a lot of fat left to cut. The focus needs to be on broadening the sponsor base, staying active with grant opportunities, and using
          the strength of the junior program and recent on-field success to build new relationships around the club.
        </p>
        <p>
          On behalf of the club, I would like to extend my thanks to the broader committee, junior coordinators, Trena on afternoon teas, BBQ
          helpers, scorers, and everyone else who put their hand up when the club needed it. None of this happens without that work.
        </p>
        <p>
          Overall, the club remains financially stable, but tight. This was a positive result and a meaningful improvement on last year, but
          we need to keep building sustainable revenue streams if we want to continue investing in the club.
        </p>
      </div>
    </article>
  );
}

export default TreasurersReport;
