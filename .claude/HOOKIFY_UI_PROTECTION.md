# Hookify Rules to Protect UI During Performance Optimization

These hookify rules ensure Claude NEVER modifies your visual design when optimizing performance.

## Installation

After installing the performance optimization skill, run these hookify commands:

```bash
# Rule 1: Protect visual design
/hookify When optimizing performance, NEVER modify colors, fonts, spacing, layouts, animations, or any visual design elements. Only optimize technical implementation while preserving exact appearance.

# Rule 2: Require visual equivalence
/hookify Before suggesting any performance optimization, verify it produces IDENTICAL visual output. If appearance changes even slightly, reject the optimization.

# Rule 3: Preserve animations
/hookify When optimizing animations, maintain the exact same visual effect. Only change implementation method (e.g., CSS instead of JS), never remove or simplify the animation.

# Rule 4: Image quality protection
/hookify When optimizing images with next/image, always set quality={90} or higher to preserve visual fidelity. Never compress images to the point of visible quality loss.

# Rule 5: Font rendering protection
/hookify When optimizing fonts, ensure the exact same font family, weight, and rendering. Font optimization must be invisible to users.

# Rule 6: Layout stability
/hookify All performance optimizations must maintain layout stability. CLS (Cumulative Layout Shift) must not increase. Reserve space for dynamic content.

# Rule 7: Design system integrity
/hookify Never suggest removing or simplifying design system components for performance. Optimize their implementation, not their design.

# Rule 8: Brand protection
/hookify NEVER modify brand colors, logos, typography choices, or brand identity elements under any circumstances, even for performance.
```

## Usage Examples

### ✅ CORRECT Optimizations (Preserves UI)

```bash
> Optimize my homepage

Claude suggests:
- Replace <img> with <Image> (same dimensions, quality)
- Use next/font/google for fonts (identical rendering)
- Add blur placeholder to images (smooth loading)
- Implement connection pooling (backend only)
- Add database indexes (backend only)
```

### ❌ INCORRECT Suggestions (Would Change UI)

```bash
> Optimize my homepage

If Claude suggests:
- "Remove this gradient background" → BLOCKED by hookify
- "Simplify this animation" → BLOCKED by hookify  
- "Use a simpler font" → BLOCKED by hookify
- "Reduce image quality to 50%" → BLOCKED by hookify
- "Remove these shadows for performance" → BLOCKED by hookify
```

## How It Works

When you have both the performance skill AND these hookify rules:

1. You ask: "Optimize my app"
2. Performance skill analyzes code
3. Before suggesting changes, hookify rules check:
   - Does this change visual appearance? → REJECT
   - Does this maintain exact design? → APPROVE
4. Only visual-preserving optimizations are suggested

## Testing Your Protection

Try this to verify it works:

```bash
# This should trigger protection
> Remove animations to improve performance

# Expected response:
"I cannot remove animations as that would change the visual design.
Instead, I'll optimize the animation implementation using CSS 
transforms which maintains the exact same visual effect but performs better.
The animation will look identical to users."
```

## Combine With Frontend-Design

For the ultimate setup:

```bash
# 1. Install frontend-design (creates beautiful UIs)
/plugin install frontend-design@anthropics

# 2. Install performance optimizer (makes them fast)
# (You already have this)

# 3. Add protection rules (preserves design)
# (Run all 8 hookify commands above)
```

**Result:** Claude creates gorgeous UIs AND optimizes them WITHOUT sacrificing design quality!

## Pro Tip: Design-First Workflow

```bash
# Step 1: Design (frontend-design skill)
> Build a landing page with art deco aesthetic

# Step 2: Protect the design (hookify rules)
# (Already installed from above)

# Step 3: Optimize (performance skill)
> Optimize this page for Core Web Vitals

# Result: Fast AND beautiful!
```

## Verification

Check your active hookify rules:

```bash
/hookify

# Should show all 8 protection rules
# If any are missing, re-run that specific command
```

## If Claude Still Suggests Visual Changes

Sometimes Claude might not realize something affects visuals. You can add custom rules:

```bash
# Project-specific protection
/hookify In this project, NEVER modify the hero section gradient, it's our brand identity

/hookify The card hover effects are critical UX, optimize implementation only

/hookify Our font pairing (Playfair Display + Inter) is non-negotiable
```

## Summary

These 8 hookify rules ensure:
- ✅ Performance optimizations preserve exact visual appearance
- ✅ Animations stay, just get faster implementation  
- ✅ Images maintain quality while loading faster
- ✅ Fonts look identical, load optimally
- ✅ Brand identity protected
- ✅ Design system integrity maintained
- ✅ Zero compromise on aesthetics

**Performance + Design = Not a tradeoff anymore!**
