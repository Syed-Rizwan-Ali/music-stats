# Using Impeccable with Antigravity for Your Stats.fm Project

## What is Impeccable?

<cite index="2-1">Impeccable is an enhanced skill that extends Anthropic's original frontend-design skill with 7 domain-specific reference files covering typography, color and contrast (OKLCH), spatial design, motion design, interaction design, responsive design, and UX writing.</cite> It stops AI-generated UIs from looking generic and ensures Antigravity builds something that looks professionally designed, not "AI slop."

**For your project:** Impeccable will help you maintain a cohesive dark theme, get spacing and typography right, and ensure responsive design without micro-managing Antigravity on every detail.

---

## Full Setup Steps

### Step 1: Install Impeccable (One-time)

<cite index="6-1">Run `npx impeccable install` from your project root.</cite>

```bash
# Navigate to your stats.fm project folder
cd your-project-folder

# Install Impeccable
npx impeccable install
```

This will:
- Download Impeccable for your tool (Antigravity / Claude Code / Cursor).
- Create a `.impeccable/` directory with design reference files.
- Add `.impeccable.md` config files to your project.

**For Claude.ai/Antigravity:** If the above doesn't work in your interface, download from [impeccable.style](https://impeccable.style) and extract the ZIP to your project manually.

---

### Step 2: Initialize Impeccable Context

<cite index="6-1">Run `/impeccable init` inside your AI coding tool to gather design context and write PRODUCT.md and DESIGN.md.</cite>

When you use Antigravity (or Claude Code), run:

```
/impeccable init
```

Impeccable will ask:
1. **Is this a brand surface or a product surface?**
   - Answer: **Product** (you're building a listening dashboard, not a marketing site).
   
2. **What's the project name?**
   - Answer: `stats.fm listening dashboard` or `VibePulse`.

3. **Describe the purpose in 1–2 sentences:**
   - Example: *"A personal website that displays my Spotify listening stats from stats.fm. Dark theme, bento-grid layout, real-time data fetching, shareable link."*

4. **Key design decisions (colors, fonts, brand)?**
   - Example: *"Dark theme (#0a0a0b background), green accent (#22c55e), Inter + JetBrains Mono fonts, 16px radius cards, 12-column grid, mobile-first responsive."*

This creates two files:
- **PRODUCT.md** — your project brief (Impeccable reads this before every design command).
- **DESIGN.md** — your design system (typography, spacing, colors, motion).

**These files travel with your project** and tell Antigravity the rules to follow.

---

### Step 3: Provide Your Reference Screenshot to Impeccable

When you send the prompt to Antigravity, also include:

```
I have a design reference (the VibePulse screenshot). 
Use /impeccable extract on it first to pull out the design tokens and component patterns, 
so every card Antigravity builds respects the same spacing, colors, and font scales.
```

Then ask Antigravity to run:

```
/impeccable extract --from-screenshot "path-to-screenshot.png"
```

(Antigravity will then scan your reference and pull out reusable design patterns into DESIGN.md.)

---

## How to Use Impeccable Commands While Building

Once Impeccable is initialized, use these commands in your Antigravity prompts to improve the UI at each build stage:

### Command 1: `/impeccable shape` (Planning Phase)

**Before** Antigravity writes code, ask it to plan the UX:

```
/impeccable shape

I want:
- A dark header with user avatar, name, and range toggle
- Three stat cards (top track hero, listening time, genres)
- A ranked top 10 tracks list with hover states
- Responsive grid: 3 cols desktop, 2 tablet, 1 mobile
```

Impeccable will outline the layout structure, spacing grid, and component hierarchy **without** writing code yet.

**Why:** Catches design issues early. Avoids rewriting code after the fact.

---

### Command 2: `/impeccable craft` (Building Phase)

After `/impeccable shape`, use this to build with design baked in:

```
/impeccable craft

Build the top 10 tracks list:
- Numbered rows (01–10)
- Album cover + title + artists on left
- Play count on right
- Hover highlight state
- Click opens Spotify
- Mobile: stack vertically
```

Antigravity will write HTML/CSS that respects your DESIGN.md system automatically.

**Why:** Impeccable reminds Antigravity of your brand rules (colors, spacing, fonts) without you repeating them every time.

---

### Command 3: `/impeccable normalize` (Mid-build Alignment)

If a card doesn't match your design system:

```
/impeccable normalize cards

Fix the card styling:
- Ensure all cards use --card and --card-border tokens
- Consistent 16px radius and padding
- Spacing follows 4px grid
```

Impeccable will scan the code and adjust it to match your system.

---

### Command 4: `/impeccable polish` (Final Pass)

Before shipping, run this on each page section:

```
/impeccable polish header

Final design review:
- Check hierarchy (is the accent green loud enough on artist names?)
- Verify contrast on --muted text
- Ensure button states are obvious
- Make sure it feels intentional, not generic
```

Impeccable will:
- Review spacing, typography, and color balance.
- Suggest micro-refinements (e.g., "add 2px letter spacing to labels").
- Ensure it aligns with your design system.

---

### Command 5: `/impeccable critique` (UX Review)

Once the layout is built, ask Impeccable to review the experience:

```
/impeccable critique

Review the listening dashboard for:
- Is the information hierarchy clear? (What catches the eye first?)
- Does the range toggle feel discoverable?
- Is the top track hero card compelling?
- Does the layout guide the eye logically?
```

Impeccable will give feedback like:
- "The hero card should be larger on desktop to draw focus."
- "The toggle button needs stronger hover feedback."
- "Genres list feels cramped; add more breathing room."

---

## Workflow: Building With Impeccable + Antigravity

Here's the full flow:

### Phase 1: Setup (One-time)
1. Run `npx impeccable install`
2. Run `/impeccable init` in Antigravity
3. Share your reference screenshot with Antigravity
4. Ask Antigravity to run `/impeccable extract` on it

### Phase 2: Planning
5. Send the `plan.md` to Antigravity
6. Ask Antigravity to run `/impeccable shape` for layout planning
7. Approve the layout structure

### Phase 3: Building (Follow Build Order from plan.md)
8. **For top 10 tracks list:**
   ```
   /impeccable craft
   Build the top 10 tracks list using the card system...
   ```

9. **For header + toggle:**
   ```
   /impeccable craft
   Build the header with avatar, name, and range toggle...
   ```

10. **For hero card:**
    ```
    /impeccable craft
    Build the top track hero card with large cover, green accent text...
    ```

11. **For each new card**, use `/impeccable craft` to build it with design rules.

### Phase 4: Polish
12. **Between sections**, run `/impeccable normalize` to keep consistency.
13. **When all cards are done**, run `/impeccable polish` on the full page.
14. **Final UX review** with `/impeccable critique`.

### Phase 5: Ship
15. Test responsive (375px width) and deploy.

---

## What to Tell Antigravity in Your Initial Prompt

Include this section in your Antigravity prompt:

```
DESIGN SETUP WITH IMPECCABLE:

1. First, run: /impeccable init
   - This is a Product surface (dashboard app)
   - Project: "stats.fm listening dashboard"
   - Purpose: Dark theme bento-grid, real data from stats.fm API
   - Design: Dark #0a0a0b, green accent #22c55e, Inter + JetBrains Mono, 
     16px radius, 12-col grid, mobile-first responsive

2. After init, run: /impeccable extract
   (I'll provide the VibePulse reference screenshot later)
   This pulls design tokens from the mockup into your DESIGN.md.

3. For each build step, use:
   - /impeccable shape (plan layouts)
   - /impeccable craft (build with design baked in)
   - /impeccable normalize (mid-build alignment)
   - /impeccable polish (final pass)
   - /impeccable critique (UX review)

This ensures every card respects the dark theme, spacing, and brand rules 
without me repeating them in every prompt.
```

---

## Commands Reference Card

| Command | When to Use | What It Does |
|---------|-------------|--------------|
| `/impeccable init` | First build only | Sets up PRODUCT.md + DESIGN.md with your brand rules |
| `/impeccable shape` | Before coding | Plan the layout and UX structure |
| `/impeccable craft` | Building each section | Write code that respects your design system |
| `/impeccable extract` | After init | Pull tokens from your reference screenshot |
| `/impeccable normalize` | Mid-build consistency | Fix spacing/color issues against your system |
| `/impeccable polish` | Before shipping | Final design pass—hierarchy, spacing, micro-refinements |
| `/impeccable critique` | After layout done | UX review—clarity, emotional resonance, flow |
| `/impeccable document` | Anytime | Generate a DESIGN.md from existing code |

---

## Common Impeccable Use Cases for Your Project

### Use Case 1: Card Styling Consistency
**Problem:** One card looks too tight, another has weird spacing.

**Solution:**
```
/impeccable normalize

Fix all cards to use:
- 16px padding
- 1px border with --card-border
- 16px radius
- Consistent gap spacing (4 or 8px per grid)
```

### Use Case 2: Dark Theme Enforcement
**Problem:** Some text is hard to read on dark, some colors don't match the accent green.

**Solution:**
```
/impeccable polish

Audit color usage:
- All accent elements (artist names, play counts) must use #22c55e
- Body text must be --text (#f4f4f5), never lighter
- Muted labels must be --muted (#8b8b94) with sufficient contrast
```

### Use Case 3: Responsive Breakpoints
**Problem:** Layout breaks on mobile or looks cramped on tablet.

**Solution:**
```
/impeccable craft

Build with responsive:
- 3-column grid on desktop (1100px+)
- 2-column on tablet (768px–1099px)
- 1-column on mobile (375px–767px)
- Adjust font sizes and gaps per breakpoint
```

### Use Case 4: Before/After Critique
**Problem:** You want feedback before shipping.

**Solution:**
```
/impeccable critique

Review the full listening dashboard:
- Is the hero card the star, or does it compete with the list?
- Does the range toggle stand out?
- Is there enough white space (dark space)?
- Do hover and interaction states feel intentional?
```

---

## Key Impeccable Mindsets

1. **Impeccable is not Figma.** It doesn't mock up visuals. It teaches Antigravity design rules so the code *is* well-designed.

2. **DESIGN.md is your source of truth.** Once it's written (by `/impeccable init` and `/impeccable extract`), Impeccable uses it to check every code change. You don't have to repeat "use the green accent" every time—Impeccable remembers.

3. **Commands are additive.** You run `/impeccable shape`, then `/impeccable craft`, then `/impeccable normalize`, then `/impeccable polish`. Each one refines the previous step. You don't replace code; you improve it.

4. **Use it per-section, not just at the end.** Don't wait until the whole site is done to run `/impeccable polish`. Polish each section (header, hero card, list) as you go so you catch issues early.

5. **Extract from your mockup early.** The VibePulse screenshot is design gold. `/impeccable extract` pulls its spacing, color palette, and typography rules into DESIGN.md. Then Antigravity builds the rest using those rules as a guide.

---

## Troubleshooting

### "I'm using Antigravity in Claude.ai, will Impeccable work?"

Impeccable was built for Claude Code (VS Code plugin) and Cursor. <cite index="10-1">You can download the Impeccable ZIP from impeccable.style and extract it to your project manually.</cite> Then, when you send prompts to Antigravity in Claude.ai, reference your local DESIGN.md file:

```
I have a DESIGN.md file in my project (see attached).
Before building, read it so every card respects the design tokens.
```

### "I initialized Impeccable but it doesn't seem to be working."

Check:
1. Is DESIGN.md in your project root? (`ls DESIGN.md`)
2. When sending prompts to Antigravity, explicitly mention: "Read DESIGN.md to see my design rules."
3. Use `/impeccable commands` in your prompt. If Antigravity doesn't recognize them, add context: "/impeccable is a design command—run it first to review your DESIGN.md."

### "The design feels generic even after /impeccable polish."

1. Run `/impeccable extract` again on your reference screenshot to pull finer details.
2. Ask Antigravity to run `/impeccable critique` for UX feedback (not just visual polish).
3. Add more specific brand rules to your DESIGN.md: micro-interactions, animation timing, button states, etc.

---

## Final Checklist Before You Start Antigravity

- [ ] Impeccable is installed (`npx impeccable install`)
- [ ] PRODUCT.md and DESIGN.md exist in your project
- [ ] You have the VibePulse screenshot ready to share
- [ ] You've read plan.md and the Antigravity prompt
- [ ] You know which Impeccable commands to use at each build step (shape → craft → normalize → polish)
- [ ] You're ready to tell Antigravity: "Read DESIGN.md first, then build."

Now you're ready to send the full prompt + plan.md + reference screenshot to Antigravity and get a beautifully designed stats.fm dashboard!
