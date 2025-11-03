(define-trait sip010-ft-trait
  (
    ;; Transfer tokens from `sender` to `recipient`. Optional `memo` per SIP-010.
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))

    ;; Token metadata
    (get-name () (response (string-ascii 32) uint))
    (get-symbol () (response (string-ascii 10) uint))
    (get-decimals () (response uint uint))

    ;; Supply and balances
    (get-total-supply () (response uint uint))
    (get-balance (principal) (response uint uint))

    ;; Optional metadata URI
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)
