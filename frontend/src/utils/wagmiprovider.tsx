// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck comment
import {
  connectorsForWallets,
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  argentWallet,
  coinbaseWallet,
  imTokenWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  omniWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

import "@rainbow-me/rainbowkit/styles.css";
import { configureChains, createConfig, WagmiProvider, http } from "wagmi";

import {
  polygonZkEvmCardona,
  skaleCalypsoTestnet,
  sepolia,
  flowTestnet,
} from "wagmi/chains";
import { Chain } from "wagmi/chains";

// Define Polygon Amoy testnet
const polygonAmoy: Chain = {
  id: 80002,
  name: "Polygon Amoy",
  nativeCurrency: {
    decimals: 18,
    name: "MATIC",
    symbol: "MATIC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-amoy.polygon.technology"],
    },
    public: {
      http: ["https://rpc-amoy.polygon.technology"],
    },
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://amoy.polygonscan.com",
    },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: "ETHSF",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  chains: [sepolia, polygonAmoy],
  transports: {
    [(sepolia.id, polygonAmoy.id)]: http(),
  },
});
const queryClient = new QueryClient();

function WagmiConnect(props: any) {
  return (
    <>
      {config && (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={darkTheme({
                accentColor: "#1E88E5",
                borderRadius: "large",
                overlayBlur: "small",
              })}
              coolMode
            >
              {props.children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      )}
    </>
  );
}

export default WagmiConnect;
