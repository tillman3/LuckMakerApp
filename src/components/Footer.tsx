import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.03] mt-auto bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xl">🍀</span>
              <div className="flex items-baseline gap-0.5">
                <span className="font-black text-neon text-base">LUCK</span>
                <span className="font-black text-white/80 text-base">MAKER</span>
                <span className="font-black text-gold text-base">3000</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              Smart lottery analytics. Real math, real odds, real utility.
              We help you play smarter — we don&apos;t predict winners.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">Links</h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link href="/about" className="text-gray-600 hover:text-white transition-colors">How It Works</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-white transition-colors">Pricing</Link>
              <Link href="/games" className="text-gray-600 hover:text-white transition-colors">All Games</Link>
              <Link href="/results" className="text-gray-600 hover:text-white transition-colors">Results</Link>
              <Link href="/support" className="text-gray-600 hover:text-white transition-colors">Support</Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">Disclaimer</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Lottery is entertainment. The house always has an edge. Past results do not 
              predict future outcomes. Expected value calculations are estimates based on 
              publicly available data. Luck Maker 3000 does not sell lottery tickets or 
              guarantee any outcomes. Play responsibly.
            </p>
          </div>
        </div>
        <div className="section-divider" />
        <div className="text-center text-xs text-gray-700">
          © {new Date().getFullYear()} Luck Maker 3000. All rights reserved. Not affiliated with any state lottery commission.
        </div>
      </div>
    </footer>
  );
}
