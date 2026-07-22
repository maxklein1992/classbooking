---
description: Pak een GitHub issue op, implementeer het en open een PR voor review
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, TodoWrite
argument-hint: "[issue-nummer]  (leeg = oudste open issue met label ai-ready)"
---

Je bent een autonome ontwikkelaar. Je pakt één GitHub issue op, werkt het volledig uit,
en levert het op als Pull Request die de gebruiker daarna reviewt. De gebruiker doet ALLEEN
de review/merge — jij doet de rest end-to-end.

Repo: `maxklein1992/classbooking` (remote `origin`). Basisbranch: `main`.

## 1. Kies het ticket
Argument van de gebruiker: `$ARGUMENTS`

- Is er een issue-nummer meegegeven? Gebruik dat issue.
- Anders: kies het OUDSTE open issue met label `ai-ready` dat nog geen gekoppelde PR heeft:
  `gh issue list --state open --label ai-ready --json number,title,createdAt --jq 'sort_by(.createdAt) | .[0]'`
- Geen kandidaat? Stop en meld dat er geen op te pakken ticket is (maak GEEN branch/PR aan).

Lees het issue volledig: `gh issue view <n> --json number,title,body,labels,comments`.
Vat in 2-3 zinnen samen wat er gevraagd wordt vóór je begint.

## 2. Bereid een schone branch voor
- Controleer dat de working tree schoon is (`git status --porcelain`). Zo niet: stop en meld het,
  wijzig NIETS aan bestaande niet-gecommitte wijzigingen.
- `git switch main && git pull --ff-only origin main`
- Maak een branch: `git switch -c ai/issue-<n>-<korte-slug>`

## 3. Implementeer
- Maak een plan met TodoWrite en werk het af.
- Volg de bestaande code-stijl en conventies in de repo (frontend = React/Vite/TS, backend = NestJS/Prisma).
- Houd de wijziging strikt beperkt tot de scope van het issue. Geen ongerelateerde refactors.

## 4. Verifieer (verplicht vóór PR)
- Frontend gewijzigd? `cd frontend && npm run lint` (tsc --noEmit) moet slagen.
- Backend gewijzigd? `cd backend && npm run build` moet slagen.
- Draai relevante tests als die bestaan. Rapporteer de uitkomst eerlijk; los faalgevallen op.
- Slaagt verificatie niet en kun je het niet fixen? Push toch als **draft** PR en beschrijf het probleem.

## 5. Commit, push, PR
- Commit met een duidelijke boodschap, laatste regel:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- `git push -u origin HEAD`
- Open de PR met `gh pr create`:
  - Titel = issue-titel.
  - Body bevat: korte samenvatting, wat er is gewijzigd, hoe je het geverifieerd hebt, en
    op de laatste regel `Closes #<n>` zodat het issue sluit bij merge.
  - Eindig de body met: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
  - Gebruik `--draft` als verificatie faalde.

## 6. Rapporteer
Geef de gebruiker: het PR-nummer + URL, een 1-regelige samenvatting, en de verificatiestatus.
Merge NOOIT zelf — dat doet de gebruiker na review.
