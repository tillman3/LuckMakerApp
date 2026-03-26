import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🍀</span>
              <span className="font-bold text-lg">
                <span className="text-neon">Luck</span> Maker <span className="text-gold">3000</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Smart lottery analytics. Real math, real odds, real utility.
              We help you play smarter — we don&apos;t predict winners.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-300 mb-3">Links</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/about" className="text-gray-500 hover:text-neon transition-colors">How It Works</Link>
              <Link href="/pricing" className="text-gray-500 hover:text-neon transition-colors">Pricing</Link>
              <Link href="/games" className="text-gray-500 hover:text-neon transition-colors">All Games</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-300 mb-3">Disclaimer</h3>
            <p className="text-xs text-gray-600">
              Lottery is entertainment. The house always has an edge. Past results do not 
              predict future outcomes. Expected value calculations are estimates based on 
              publicly available data. Luck Maker 3000 does not sell lottery tickets or 
              guarantee any outcomes. Play responsibly.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-dark-700 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Luck Maker 3000. All rights reserved. Not affiliated with any state lottery commission.
        </div>
      </div>
    </footer>
  );
}
