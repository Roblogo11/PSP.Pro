import { http, createConfig } from 'wagmi'
import { mainnet, polygon, optimism, base } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// WalletConnect Cloud Project ID - get one at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, optimism, base],
  connectors: [
    injected(), // MetaMask, Brave, etc.
    ...(projectId
      ? [
          walletConnect({ projectId }),
          coinbaseWallet({ appName: 'ShockAI' }),
        ]
      : []),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
