# Discord Server — Setup Pack

> Alles was du beim Discord-Setup kopieren kannst. Server-Erstellung
> selbst dauert ~5 Min, Channel-Anlage + Inhalte einfügen ~30 Min.
> Brand-conform: editorial Ton, keine Emoji-Spam, knappe Sätze.

---

## Server-Basics

**Server-Name:** `VozClara`
**Server-Icon:** `public/brand-mark-256.png` (lokal im Repo) — gold Lighthouse-Seal auf transparent. Beim Discord-Upload croppt es automatisch zum Kreis, sieht sauber aus.
**Server-Banner** (Discord-Premium-Feature, skip wenn du keinen Boost willst): das `og-image.png` würde passen.

**System-Sprache:** Englisch — Founder werden international sein, der Server ist nicht der Locale-Layer.

---

## Channel-Struktur

Drei Channels reichen. Mehr Komplexität braucht's bei <100 Mitgliedern nicht.

### `#general`
**Topic (das kurze Feld unter dem Channel-Namen):**
```
General talk · feature ideas · screenshots · whatever's on your mind
```

### `#feature-requests`
**Topic:**
```
What you want next. One request per message — react with 👍 to vote.
```

### `#founders-only`
**Topic:**
```
For the first 100 founding members. Closed channel — direct line to Christian.
```
**Permissions:** Channel-Settings → Permissions → @everyone darf nicht reinschauen. Neuer Role `Founder` anlegen, der hat View + Send permissions. Beim Stripe-Founder-Kauf → Role manuell zuweisen (post-launch automatisierbar via Bot).

---

## Welcome-Message für `#general` (Pinned)

Diesen Post anpinnen sobald der Channel steht:

```
Welcome to VozClara.

This server is small by design. Three rooms:

#general — where most talk happens
#feature-requests — vote with 👍 on what you want next
#founders-only — closed channel for the first 100 founding members

A few things to know about this space:

— I (Christian, the maker) read everything. I won't always reply
  in 10 minutes, but nothing here disappears unread.

— No hierarchy of "valid" feedback. A typo report and a strategic
  rethink go in the same channel. Both useful.

— No silent shipping. When something new lands on vozclara.app
  it gets a message here first, with a paragraph on why.

If you signed up via the Founder Deal, send me a message and I'll
add you to #founders-only. You'll also get the first look at
Watch Mode, the Chrome extension, and cross-device sync — usually
2-3 weeks before public release.

— Christian, Frankfurt
```

---

## Welcome-Message für `#founders-only` (Pinned)

Anders im Ton — direkter, weniger formal, mehr Insider:

```
The first 100. You.

Three concrete things this channel gives you that the public side
doesn't:

1. Roadmap voting. Each month I post the three things I'm
   considering shipping next. You vote with reactions. Highest
   total wins.

2. Beta access. Watch Mode (synced video transcript), the Chrome
   extension, cross-device library sync, and the Notion / Obsidian
   exporter all land here weeks before public release. You're the
   pressure test.

3. Direct line. If you have a frustration with the app, screenshot
   it here. I'll respond personally — usually within 24 h, faster
   if I'm awake.

The implicit contract: you got Pro for life at €99 because you
showed up early. In return I lean on this room when I need a
sanity check before a launch. Honest feedback over polite feedback.

— Christian
```

---

## Server-Rules (für `#general` als zweiter Pinned-Post, optional)

Discord erwartet eigentlich Server-Rules. Knapp:

```
The short list:

— Stay civil. Disagreement is fine, contempt isn't.
— Don't post other people's keys, emails, or personal info.
— No external recruiting / spam / self-promo unrelated to VozClara.
— English in #general so the room stays inclusive. Your DMs in
  your native language are fine.

That's it. If something here ever feels off, ping @Christian.
```

---

## Roles to Create

Discord → Server-Settings → Roles → Create Role.

1. **`Founder`** (color: gold `#C9A24B`) — for the first 100 founding-deal buyers. Has access to `#founders-only` plus a visible role-badge next to their username.
2. **`Christian`** (color: navy `#0A1A3A`) — assigned to your own account so people can ping `@Christian` when needed.

No `Admin` role needed at launch — you're the only admin and your own account already has owner permissions.

---

## Invite-Link Strategy

Discord → Server-Settings → Invites → Create Invite:
- **Maximale Verwendung:** No limit
- **Ablauf:** Never
- **Save**

Den `https://discord.gg/<code>` Link an drei Stellen:

1. **Welcome-Email für Founder-Käufer** — der Stripe-Email-Trigger sollte den Link enthalten. (Wir bauen den Email-Template gleich.)
2. **`/founder` Page** — am Ende der „What's included"-Liste: „Direkter Discord-Zugang — Link nach Kauf per Email."
3. **Footer der Site** — irgendwo unauffällig. Optional, kannst auch erst nach Launch hinzufügen wenn die ersten 10 Founder drin sind.

---

## Stripe → Discord Auto-Onboarding (post-launch, optional)

Sobald 10-20 Founder gekauft haben und manuelles Role-Zuweisen lästig wird, lohnt sich:

- Stripe Webhook → Cloudflare Worker → Discord-API-POST
- Discord-Bot generiert Single-Use-Invite mit Founder-Role direkt vergeben
- Welcome-DM mit Pro-Activation-Hinweis

Aufwand: 2 h. Lohnt sich erst ab ~10 Käufen — vorher ist manuell schneller.

---

## Setup-Checkliste

Beim Discord-Setup heute Abend durchgehen:

- [ ] Server `VozClara` erstellt
- [ ] Icon `brand-mark-256.png` hochgeladen
- [ ] `#general` Channel mit Topic + Welcome-Pinned
- [ ] `#feature-requests` Channel mit Topic
- [ ] `#founders-only` Channel mit Topic + Permissions (only `Founder` role + `Christian`) + Welcome-Pinned
- [ ] `Server-Rules` als zweiter Pinned in `#general` (optional)
- [ ] Role `Founder` (gold) erstellt
- [ ] Role `Christian` (navy) selbst zugewiesen
- [ ] Permanent-Invite-Link generiert + irgendwo notiert
- [ ] Test: zweiter Browser → Invite öffnen → siehst du den Server wie ein neuer User?

---

— Setup-Pack Mo 18.5.2026
