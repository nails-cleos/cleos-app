# Cleos

Cleos is an Angular 21 application for running a beauty and appointment business. It combines the public booking experience, customer self-service flows, and back-office management in a single app.

The project includes:

- Public catalogue and treatment pages
- Customer flows for booking, payments, referrals, and reservation management
- Internal dashboards for reservations, invoices, statements, users, rooms, offices, treatments, discounts, and availability
- PWA support, Firebase integrations, and Cypress/Karma test coverage

## Tech Stack

- Angular 21
- Angular Material
- NgRx Store / Effects / Router Store
- RxJS
- SCSS
- Firebase
- Cypress and Karma/Jasmine

## Requirements

- Node `v24.12.0`
- npm `11.6.2`

The expected versions are defined in [package.json](/Users/lucasscarlatta/Developer/Lucas/cleos-app/package.json).

## Getting Started

Install dependencies:

```bash
npm install
```

Start the app in development mode:

```bash
npm run start:dev
```

The dev server runs on `http://localhost:4300`.

## Available Scripts

- `npm run start:dev` starts the Angular dev server on port `4300`
- `npm run serve` starts the dev server on `0.0.0.0:4300`
- `npm run build-development` builds the app with the development configuration
- `npm run build` builds the production bundle
- `npm run build-pwa` builds the PWA bundle
- `npm run test` runs unit tests with Karma
- `npm run lint` runs Angular ESLint
- `npm run lint:fix` runs Angular ESLint with autofix
- `npm run cypress:run` runs Cypress end-to-end tests
- `npm run cypress:open` starts the app and opens Cypress interactively

## Build Configurations

The application ships with multiple Angular build targets:

- `development`
- `production`
- `staging`
- `pwa`

Environment files live in [src/environments](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/environments).

## Project Structure

Main application areas inside [src/app](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/app):

- [src/app/main](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/app/main): public landing, catalogue, legal, and marketing pages
- [src/app/me](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/app/me): customer-facing reservation, payment, and referral flows
- [src/app/reservation](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/app/reservation): reservation management, search, calendar, and detail screens
- [src/app/account](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/app/account): customer account balances and transactions
- [src/app/dashboard](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/app/dashboard): reporting and operational dashboard views
- [src/app/shared](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/app/shared): reusable UI building blocks
- [src/app/store](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/app/store): actions, reducers, selectors, and effects
- [src/app/services](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/app/services): API and integration services

Other important folders:

- [src/assets](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/assets): images, icons, and static assets
- [cypress](/Users/lucasscarlatta/Developer/Lucas/cleos-app/cypress): end-to-end tests
- [scripts](/Users/lucasscarlatta/Developer/Lucas/cleos-app/scripts): project utility scripts

## Testing

Run unit tests with coverage:

### Local Coverage Diff Check (optional)

To verify how your current branch affects test coverage compared to `develop`, you can use `diff-cover`.

This is **only for local development**. The CI pipeline already runs full LCOV coverage checks.

#### Generate diff coverage report

First make sure you have an LCOV report generated:

```bash
npm run test
```

Then run the diff coverage check against the `develop` branch:

```bash
BASE=develop npm run coverage:diff
```

### What it does

- Compares your current branch against develop
- Shows coverage impact only for changed lines
- Fails if diff coverage drops below 80%
- Generates an HTML report at: coverage/diff-cover-report.html

Run a TypeScript-only spec compile check:

```bash
npx tsc -p tsconfig.spec.json --noEmit
```

Run Cypress:

```bash
npm run cypress:run
```

## PWA Notes

PWA-related files include:

- [src/manifest.json](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/manifest.json)
- [src/firebase-messaging-sw.js](/Users/lucasscarlatta/Developer/Lucas/cleos-app/src/firebase-messaging-sw.js)
- [ngsw-config.json](/Users/lucasscarlatta/Developer/Lucas/cleos-app/ngsw-config.json)

To build the PWA bundle:

```bash
npm run build-pwa
```

## Notes For Contributors

- Styles are written in SCSS
- State management is handled with NgRx
- The app uses Angular standalone components in several areas
- Payment, reservation, and account flows are tightly connected, so changes there usually need both UI and store-level verification

## Troubleshooting

- If the app cannot reach backend services locally, check [proxy.conf.json](/Users/lucasscarlatta/Developer/Lucas/cleos-app/proxy.conf.json)
- If test execution fails in the browser runner, try the TypeScript spec compile check first to separate compile errors from Karma/browser issues
- If you are working on production or staging behavior, verify the active Angular configuration and environment replacement in [angular.json](/Users/lucasscarlatta/Developer/Lucas/cleos-app/angular.json)
