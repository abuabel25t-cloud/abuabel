# Abuabel - User Profile Management Smart Contract

[![Clarity](https://img.shields.io/badge/Clarity-Smart%20Contract-orange)](https://clarity-lang.org/)
[![Stacks](https://img.shields.io/badge/Stacks-Blockchain-purple)](https://www.stacks.co/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Abuabel is a comprehensive smart contract built on the Stacks blockchain for managing user profiles and social connections. It enables users to create digital identities, connect with others, and build a decentralized social network.

## Features

### Core Functionality
- **User Profiles**: Create and manage detailed user profiles with usernames, bios, websites, and avatars
- **Social Connections**: Follow/unfollow other users with connection tracking
- **Username System**: Unique username-to-principal mapping for easy user discovery
- **Verification System**: Admin-controlled user verification badges
- **Connection Analytics**: Track follower and following counts for each user
- **Contract Administration**: Pausable contract with owner controls

### Security Features
- Input validation for all user data
- Prevention of duplicate usernames and profiles
- Protection against self-following
- Authorization checks for admin functions
- Emergency pause functionality

## Smart Contract Overview

### Data Structures

#### User Profiles
```clarity
{
  username: (string-ascii 32),
  bio: (string-utf8 280),
  website: (string-ascii 100),
  avatar-url: (string-ascii 200),
  created-at: uint,
  is-verified: bool
}
```

#### User Connections
```clarity
{
  connected-at: uint,
  connection-type: (string-ascii 20)
}
```

### Public Functions

#### Profile Management
- `create-profile(username, bio, website, avatar-url)` - Create a new user profile
- `update-profile(bio, website, avatar-url)` - Update existing profile information

#### Social Connections
- `connect-to-user(target-user, connection-type)` - Follow another user
- `disconnect-from-user(target-user)` - Unfollow a user

#### Administrative
- `verify-user(user)` - Verify a user (admin only)
- `pause-contract()` - Pause contract operations (admin only)
- `unpause-contract()` - Resume contract operations (admin only)

### Read-Only Functions

- `get-user-profile(user)` - Get profile by principal
- `get-principal-by-username(username)` - Get principal by username
- `get-user-profile-by-username(username)` - Get profile by username
- `are-users-connected(user1, user2)` - Check connection status
- `get-connection-details(user1, user2)` - Get connection information
- `get-connection-counts(user)` - Get follower/following counts
- `get-total-users()` - Get total registered users
- `is-contract-paused()` - Check if contract is paused
- `get-contract-owner()` - Get contract owner address

### Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 100  | ERR_UNAUTHORIZED | User not authorized for this action |
| 101  | ERR_USER_NOT_FOUND | User profile does not exist |
| 102  | ERR_USER_ALREADY_EXISTS | User profile or username already exists |
| 103  | ERR_INVALID_USERNAME | Invalid username format |
| 104  | ERR_USERNAME_TOO_LONG | Username exceeds maximum length |
| 105  | ERR_ALREADY_CONNECTED | Users are already connected |
| 106  | ERR_CANNOT_CONNECT_TO_SELF | Cannot connect to yourself |

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Clarinet](https://github.com/hirosystems/clarinet) CLI
- [Stacks CLI](https://docs.stacks.co/understand-stacks/command-line-interface)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/abuabel.git
cd abuabel
```

2. Install dependencies:
```bash
npm install
```

3. Verify Clarinet installation:
```bash
clarinet --version
```

### Development Setup

1. Start the Clarinet console:
```bash
clarinet console
```

2. Deploy the contract locally:
```bash
clarinet deploy --devnet
```

3. Run tests:
```bash
clarinet test
```

## Usage Examples

### Creating a Profile

```clarity
(contract-call? .abuabel create-profile 
  "alice" 
  u"Software developer passionate about blockchain" 
  "https://alice.dev" 
  "https://avatar.alice.dev/photo.jpg")
```

### Connecting to Another User

```clarity
(contract-call? .abuabel connect-to-user 
  'SP1234...ABCD 
  "follow")
```

### Querying User Information

```clarity
;; Get user profile
(contract-call? .abuabel get-user-profile 'SP1234...ABCD)

;; Get connection counts
(contract-call? .abuabel get-connection-counts 'SP1234...ABCD)

;; Check if users are connected
(contract-call? .abuabel are-users-connected 
  'SP1234...ABCD 
  'SP5678...EFGH)
```

## Testing

The project includes comprehensive tests covering all contract functionality:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx vitest tests/abuabel.test.ts
```

### Test Coverage
- Profile creation and validation
- Username uniqueness enforcement
- Social connection functionality
- Error handling and edge cases
- Administrative functions
- Read-only function accuracy

## Deployment

### Testnet Deployment

1. Configure your Stacks CLI:
```bash
stx make_keychain -t
```

2. Deploy to testnet:
```bash
clarinet deploy --testnet
```

### Mainnet Deployment

1. Ensure thorough testing on testnet
2. Update configuration for mainnet
3. Deploy using:
```bash
clarinet deploy --mainnet
```

## API Reference

### Contract Interface

The contract provides a clean interface for building decentralized social applications:

```typescript
interface AbuabelContract {
  // Profile management
  createProfile(username: string, bio: string, website: string, avatarUrl: string): Promise<Principal>
  updateProfile(bio: string, website: string, avatarUrl: string): Promise<Principal>
  
  // Social connections
  connectToUser(targetUser: Principal, connectionType: string): Promise<boolean>
  disconnectFromUser(targetUser: Principal): Promise<boolean>
  
  // Query functions
  getUserProfile(user: Principal): Promise<UserProfile | null>
  getUserProfileByUsername(username: string): Promise<UserProfile | null>
  areUsersConnected(user1: Principal, user2: Principal): Promise<boolean>
  getConnectionCounts(user: Principal): Promise<{followers: number, following: number}>
}
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow Clarity best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Use meaningful commit messages
- Ensure code passes linting (`npm run lint`)

## Security Considerations

- All user inputs are validated
- Admin functions are properly protected
- Contract includes emergency pause functionality
- No sensitive data is stored on-chain
- Regular security audits recommended

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions:

- Create an [issue](https://github.com/your-username/abuabel/issues)
- Join our [Discord community](https://discord.gg/stacks)
- Follow us on [Twitter](https://twitter.com/abuabel)

## Roadmap

- [ ] Enhanced profile metadata support
- [ ] Group/community functionality
- [ ] Content sharing and interactions
- [ ] Reputation system integration
- [ ] Mobile-friendly web interface
- [ ] Integration with popular Stacks wallets

---

**Built with ❤️ on [Stacks](https://www.stacks.co/)**
