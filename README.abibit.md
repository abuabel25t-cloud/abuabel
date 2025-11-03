# Abibit smart contract (Clarity / Clarinet)

This project contains a SIP-010-style fungible token named "Abibit" (symbol: ABIB), implemented in Clarity and configured for Clarinet.

## Files
- contracts/abibit.clar — Token implementation
- contracts/sip010-ft-trait.clar — SIP-010 FT trait used by the token
- Clarinet.toml — Project configuration registering both contracts

## Quick start
1) Install Clarinet (see official docs for your OS).
2) From the project root, run checks:

```
clarinet check
```

3) Open a local REPL:

```
clarinet console
```

Within the console, try:

```
# Mint 1,000 ABIB to wallet_1 (deployer is the contract owner by default)
(contract-call? .abibit mint wallet_1 u1000)

# Transfer 250 ABIB from wallet_1 to wallet_2
(tx-sender wallet_1 (contract-call? .abibit transfer u250 wallet_1 wallet_2 none))

# Read balances and metadata
(contract-call? .abibit get-balance wallet_1)
(contract-call? .abibit get-balance wallet_2)
(contract-call? .abibit get-total-supply)
(contract-call? .abibit get-name)
(contract-call? .abibit get-symbol)
(contract-call? .abibit get-decimals)

# Optional: set a token URI (owner only)
(contract-call? .abibit set-token-uri (some "https://example.com/abib.json"))
(contract-call? .abibit get-token-uri)
```

Notes:
- The contract owner is the deployer address at deployment time; only the owner can mint or set the token URI.
- The `transfer` function requires the caller (`tx-sender`) to match the `sender` argument, aligning with a minimal SIP-010 flow (no allowances).
