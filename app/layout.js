export const metadata = {
  title: 'GGLaunch · Permanent Liquidity',
  description: 'The launchpad where liquidity cannot be pulled. Built on Solana.',
  icons: {
    icon: '/vault.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#06080f' }}>{children}</body>
    </html>
  );
}
