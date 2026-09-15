import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  polygon,
  arbitrum,
  base,
  optimism,
} from "@reown/appkit/networks";
import { QueryClient } from "@tanstack/react-query";

const projectId = "a74f0ed553beed9257f071aecc9a2e08";

const networks = [
  mainnet,
  polygon,
  arbitrum,
  base,
  optimism,
];

const metadata = {
  name: "Nova Wallet",
  description: "Nova Wallet crypto dashboard",
  url: "https://yuyang9992.github.io/nova-wallet/",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const queryClient = new QueryClient();

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  features: {
    analytics: true,
  },
});
