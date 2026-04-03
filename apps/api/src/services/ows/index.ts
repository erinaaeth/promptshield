import { env } from "../../config/env";
import { MockOwsWalletAdapter } from "./mock-ows-wallet-adapter";
import { RealOwsWalletAdapter } from "./real-ows-wallet-adapter";
import { WalletAdapter } from "./types";

export function createWalletAdapter(): WalletAdapter {
  return env.owsMode === "real" ? new RealOwsWalletAdapter() : new MockOwsWalletAdapter();
}
