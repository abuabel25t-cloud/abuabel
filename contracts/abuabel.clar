;; title: abuabel - User Profile Management Contract
;; version: 1.0.0
;; summary: A smart contract for managing user profiles and social connections
;; description: This contract allows users to create profiles, connect with others,
;;              and manage their digital identity on the Stacks blockchain

;; traits
;;

;; token definitions
;;

;; constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_USER_NOT_FOUND (err u101))
(define-constant ERR_USER_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_USERNAME (err u103))
(define-constant ERR_USERNAME_TOO_LONG (err u104))
(define-constant ERR_ALREADY_CONNECTED (err u105))
(define-constant ERR_CANNOT_CONNECT_TO_SELF (err u106))

(define-constant MAX_USERNAME_LENGTH u32)
(define-constant MAX_BIO_LENGTH u280)
(define-constant MAX_WEBSITE_LENGTH u100)

;; data vars
(define-data-var total-users uint u0)
(define-data-var contract-paused bool false)

;; data maps
(define-map user-profiles
  principal
  {
    username: (string-ascii 32),
    bio: (string-utf8 280),
    website: (string-ascii 100),
    avatar-url: (string-ascii 200),
    created-at: uint,
    is-verified: bool
  }
)

(define-map username-to-principal
  (string-ascii 32)
  principal
)

(define-map user-connections
  { user: principal, connection: principal }
  { connected-at: uint, connection-type: (string-ascii 20) }
)

(define-map connection-counts
  principal
  { followers: uint, following: uint }
)

;; public functions

;; Create a new user profile
(define-public (create-profile (username (string-ascii 32)) 
                              (bio (string-utf8 280))
                              (website (string-ascii 100))
                              (avatar-url (string-ascii 200)))
  (let ((caller tx-sender))
    (asserts! (not (var-get contract-paused)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? user-profiles caller)) ERR_USER_ALREADY_EXISTS)
    (asserts! (> (len username) u0) ERR_INVALID_USERNAME)
    (asserts! (<= (len username) MAX_USERNAME_LENGTH) ERR_USERNAME_TOO_LONG)
    (asserts! (is-none (map-get? username-to-principal username)) ERR_USER_ALREADY_EXISTS)
    
    ;; Create the profile
    (map-set user-profiles caller {
      username: username,
      bio: bio,
      website: website,
      avatar-url: avatar-url,
      created-at: burn-block-height,
      is-verified: false
    })
    
    ;; Map username to principal
    (map-set username-to-principal username caller)
    
    ;; Initialize connection counts
    (map-set connection-counts caller { followers: u0, following: u0 })
    
    ;; Increment total users
    (var-set total-users (+ (var-get total-users) u1))
    
    (print { event: "profile-created", user: caller, username: username })
    (ok caller)
  )
)

;; Update user profile
(define-public (update-profile (bio (string-utf8 280))
                              (website (string-ascii 100))
                              (avatar-url (string-ascii 200)))
  (let ((caller tx-sender)
        (existing-profile (unwrap! (map-get? user-profiles caller) ERR_USER_NOT_FOUND)))
    
    (map-set user-profiles caller 
      (merge existing-profile {
        bio: bio,
        website: website,
        avatar-url: avatar-url
      })
    )
    
    (print { event: "profile-updated", user: caller })
    (ok caller)
  )
)

;; Connect to another user (follow)
(define-public (connect-to-user (target-user principal) (connection-type (string-ascii 20)))
  (let ((caller tx-sender)
        (caller-counts (default-to { followers: u0, following: u0 } 
                                  (map-get? connection-counts caller)))
        (target-counts (default-to { followers: u0, following: u0 } 
                                  (map-get? connection-counts target-user))))
    
    (asserts! (not (var-get contract-paused)) ERR_UNAUTHORIZED)
    (asserts! (is-some (map-get? user-profiles target-user)) ERR_USER_NOT_FOUND)
    (asserts! (not (is-eq caller target-user)) ERR_CANNOT_CONNECT_TO_SELF)
    (asserts! (is-none (map-get? user-connections { user: caller, connection: target-user })) 
              ERR_ALREADY_CONNECTED)
    
    ;; Create connection
    (map-set user-connections 
      { user: caller, connection: target-user }
      { connected-at: burn-block-height, connection-type: connection-type })
    
    ;; Update connection counts
    (map-set connection-counts caller 
      (merge caller-counts { following: (+ (get following caller-counts) u1) }))
    (map-set connection-counts target-user 
      (merge target-counts { followers: (+ (get followers target-counts) u1) }))
    
    (print { event: "user-connected", from: caller, to: target-user, type: connection-type })
    (ok true)
  )
)

;; Disconnect from a user (unfollow)
(define-public (disconnect-from-user (target-user principal))
  (let ((caller tx-sender)
        (caller-counts (unwrap! (map-get? connection-counts caller) ERR_USER_NOT_FOUND))
        (target-counts (unwrap! (map-get? connection-counts target-user) ERR_USER_NOT_FOUND)))
    
    (asserts! (not (var-get contract-paused)) ERR_UNAUTHORIZED)
    (asserts! (is-some (map-get? user-connections { user: caller, connection: target-user })) 
              ERR_USER_NOT_FOUND)
    
    ;; Remove connection
    (map-delete user-connections { user: caller, connection: target-user })
    
    ;; Update connection counts
    (map-set connection-counts caller 
      (merge caller-counts { following: (- (get following caller-counts) u1) }))
    (map-set connection-counts target-user 
      (merge target-counts { followers: (- (get followers target-counts) u1) }))
    
    (print { event: "user-disconnected", from: caller, to: target-user })
    (ok true)
  )
)

;; Admin functions
(define-public (verify-user (user principal))
  (let ((profile (unwrap! (map-get? user-profiles user) ERR_USER_NOT_FOUND)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    
    (map-set user-profiles user (merge profile { is-verified: true }))
    (print { event: "user-verified", user: user })
    (ok true)
  )
)

(define-public (pause-contract)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set contract-paused true)
    (ok true)
  )
)

(define-public (unpause-contract)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set contract-paused false)
    (ok true)
  )
)

;; read only functions

;; Get user profile by principal
(define-read-only (get-user-profile (user principal))
  (map-get? user-profiles user)
)

;; Get principal by username
(define-read-only (get-principal-by-username (username (string-ascii 32)))
  (map-get? username-to-principal username)
)

;; Get user profile by username
(define-read-only (get-user-profile-by-username (username (string-ascii 32)))
  (match (map-get? username-to-principal username)
    user-principal (map-get? user-profiles user-principal)
    none
  )
)

;; Check if users are connected
(define-read-only (are-users-connected (user1 principal) (user2 principal))
  (is-some (map-get? user-connections { user: user1, connection: user2 }))
)

;; Get connection details
(define-read-only (get-connection-details (user1 principal) (user2 principal))
  (map-get? user-connections { user: user1, connection: user2 })
)

;; Get connection counts for a user
(define-read-only (get-connection-counts (user principal))
  (default-to { followers: u0, following: u0 } (map-get? connection-counts user))
)

;; Get total users count
(define-read-only (get-total-users)
  (var-get total-users)
)

;; Check if contract is paused
(define-read-only (is-contract-paused)
  (var-get contract-paused)
)

;; Get contract owner
(define-read-only (get-contract-owner)
  CONTRACT_OWNER
)

;; private functions

;; Validate username format
(define-private (is-valid-username (username (string-ascii 32)))
  (and 
    (> (len username) u0)
    (<= (len username) MAX_USERNAME_LENGTH)
  )
)
