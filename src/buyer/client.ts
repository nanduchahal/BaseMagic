/**
 * BaseMagic x402 Buyer Client
 *
 * Purpose:
 * Make paid HTTP requests using the official x402 Buyer SDK.
 */

import "dotenv/config";

import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

// -----------------------------------------------------------------------------
// Environment Configuration
// -----------------------------------------------------------------------------

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is missing from .env");
}

// Create the wallet that will sign x402 payments
const account = privateKeyToAccount(
  PRIVATE_KEY as `0x${string}`
);

// -----------------------------------------------------------------------------
// x402 Payment-enabled Fetch
// -----------------------------------------------------------------------------

export const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [
    {
      network: "eip155:8453", // Base Mainnet
      client: new ExactEvmScheme(account),
    },
  ],
});