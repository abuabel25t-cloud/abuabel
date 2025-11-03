;; Abibit SIP-010-compatible fungible token

(use-trait sip010 .sip010-ft-trait.sip010-ft-trait)

(define-fungible-token abibit)

(define-constant ERR-NOT-AUTHORIZED u403)

(define-data-var owner principal tx-sender)
(define-data-var token-uri (optional (string-utf8 256)) none)

;; SIP-010: transfer(amount, sender, recipient, memo?) -> (ok true) | (err u...)
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq sender tx-sender) (err ERR-NOT-AUTHORIZED))
    (try! (ft-transfer? abibit amount sender recipient))
    (ok true)
  )
)

;; Admin: set/update token URI metadata
(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err ERR-NOT-AUTHORIZED))
    (var-set token-uri new-uri)
    (ok true)
  )
)

;; Admin: mint new tokens to a recipient
(define-public (mint (recipient principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err ERR-NOT-AUTHORIZED))
    (try! (ft-mint? abibit amount recipient))
    (ok true)
  )
)

;; ----- SIP-010 required read-onlys -----
(define-read-only (get-name)
  (ok "Abibit Token")
)

(define-read-only (get-symbol)
  (ok "ABIB")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply abibit))
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance abibit who))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)
