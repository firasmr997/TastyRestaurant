# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Pinned by the client brief.

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, GSAP + ScrollTrigger, Three.js + React Three Fiber, React Router, Axios, Lucide icons.
- Backend: Java, Spring Boot (Web, Security + JWT, Data JPA / Hibernate, Bean Validation), Flyway, springdoc OpenAPI.
- Database: PostgreSQL. Docker Compose for PostgreSQL + backend (frontend optionally behind Nginx).

## Users

- **Guests and would-be guests (public site, primary).** Locals and visitors deciding where to eat, mostly on a phone, often minutes before they go: what's on the menu, what it costs, whether a dish is available today, when Tasty is open, how to get there. Once hooked, they browse the food and the room.
- **The Tasty team (admin).** Owner and staff keeping the site true to what is actually served: dishes, prices, categories, availability, featured dishes, photography, contact messages and restaurant details. On a laptop or tablet in quiet hours, sometimes mid-service to mark a dish sold out.

## Product Purpose

Tasty's digital home. It makes the food irresistible and the practical facts (menu, prices, availability, hours, location, contact) instant, and gives the team a CMS so the site always reflects the real kitchen. Success: a visitor finds what they came for in seconds and wants to come in; the team updates the menu without a developer.

## Positioning

Premium casual: burgers and stacked sandwiches lead, plates support, made with bistro-level care. Dine-in and takeaway, ordered at the counter or at the table. Brand pillars from the brief: fresh ingredients, quality preparation, unique recipes, premium atmosphere.

## Operating Context

- Public site: phone-first traffic, desktop second. Bilingual: English and French, with a language switcher and French content fields for dishes, categories, gallery entries and restaurant texts. English is the fallback when a French field is empty.
- Admin: desktop and tablet, English UI. Authenticated with JWT; destructive actions confirmed.
- Location is a neutral, fictional city for the demo. Address, phone, email, hours, socials and currency live in admin → Settings.

## Capabilities and Constraints

- Public: home, menu (categories from the database, search by name / description / ingredients, filters by category / availability / featured), dish detail pages, food gallery (food, sandwiches, burgers, plates, desserts, drinks), restaurant gallery (exterior, interior, dining, kitchen, bar, team, atmosphere), about, contact form stored in the database.
- Admin: dashboard with stats and light analytics, menu / category / gallery CRUD, image uploads with validation, featured and availability toggles, contact message workflow (new, read, archived), notifications, search, filters, pagination, restaurant settings.
- Out of scope unless requested later: online ordering, payments, table reservations, delivery, customer accounts, reviews.
- Categories cannot be deleted while dishes depend on them unless those dishes are reassigned.

## Brand Commitments

- Name: **TASTY**.
- Logo: modern, memorable, premium, food-appropriate, legible at favicon size. Not a generic fork-and-knife; any food symbolism must be integrated creatively.
- Palette must read as appetite, quality, modernity, premium dining and warmth, and be shared by the public site and the admin.
- Typography is part of the identity, responsive with `clamp()` for large headings.
- Food photography is visually dominant. Motion is elegant, never excessive, and respects `prefers-reduced-motion`.
- No lorem ipsum, no "Item 1"-style content.

## Evidence on Hand

- None yet: no real photography, logo, menu, prices, team, reviews, press or founding history exist.
- Everything shipped is labelled demo content: stock placeholder photography (to be replaced with Tasty's own), a demo menu with demo prices, a fictional address, phone and email.
- Never fabricate testimonials, ratings, awards, press quotes or founding claims presented as fact.

## Product Principles

1. **Food first.** Photography and dish names lead; interface chrome recedes.
2. **Facts within one tap.** Menu, prices, availability, hours and location are never more than one step away on a phone.
3. **The CMS is the source of truth.** Nothing a guest sees about the menu or the restaurant is hardcoded in UI code.
4. **Motion serves appetite and hierarchy, never waiting.** Splash at most two seconds, quick page transitions.
5. **Replaceable by design.** Demo content and placeholder images swap for real material without code changes.

## Accessibility & Inclusion

WCAG 2.1 AA target: semantic HTML, keyboard navigation, visible focus, accessible forms, alt text, sufficient contrast. `prefers-reduced-motion` significantly reduces parallax, 3D movement, large transforms and complex transitions. Bilingual EN/FR.
