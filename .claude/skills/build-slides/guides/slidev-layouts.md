# Slidev Layouts Reference Guide

Complete reference for all Slidev built-in layouts with usage guidelines and best practices.

## Layout Overview

Slidev provides 20+ built-in layouts optimized for different content types. Choose layouts based on content structure and emphasis needs.

## Layout Catalog

### 1. cover

**Purpose**: Title slides, presentation opening

**Structure**:
```markdown
---
layout: cover
background: /assets/hero.jpg
class: text-center
---

# Main Title
Subtitle or description
```

**Best For**:
- First slide of presentation
- Major section openings
- High-impact intros

**Customization**:
- `background`: Image URL or gradient
- `class`: text-center, text-left, text-right

**Notes**:
- Keep text minimal
- Use high-quality backgrounds
- Ensure text contrast

---

### 2. default

**Purpose**: Standard content slides

**Structure**:
```markdown
---
layout: default
---

# Slide Title

Content goes here with bullet points:
- Point 1
- Point 2
```

**Best For**:
- General content
- Bullet point lists
- Mixed content

**Customization**:
- Works with all standard markdown
- Supports images, code, tables

---

### 3. center

**Purpose**: Centered content for emphasis

**Structure**:
```markdown
---
layout: center
class: text-center
---

# Centered Title

Centered content for emphasis
```

**Best For**:
- Key concepts
- Definitions
- Transitions
- Diagrams

**Customization**:
- `class`: text-center (default), text-xl, text-2xl

---

### 4. section

**Purpose**: Section dividers, major topic transitions

**Structure**:
```markdown
---
layout: section
background: /assets/section-bg.jpg
---

# Section Name

Optional tagline or description
```

**Best For**:
- Starting new major sections
- Topic changes
- Mental breaks in presentation

**Customization**:
- `background`: Solid color or image
- `class`: For text styling

**Notes**:
- Use sparingly (major sections only)
- Keep text minimal
- Consistent styling across sections

---

### 5. two-cols

**Purpose**: Two-column layout for comparisons or complementary content

**Structure**:
```markdown
---
layout: two-cols
---

# Left Column

Content for left side

::right::

# Right Column

Content for right side
```

**Best For**:
- Comparisons (Do's vs Don'ts)
- Code + Explanation
- Before/After
- Pro/Con lists
- Image + Text

**Customization**:
- Default: 50/50 split
- Can use `class` to adjust

**Notes**:
- Keep content balanced
- Don't overload columns
- Works great with `<v-clicks>`

---

### 6. two-cols-header

**Purpose**: Header with two columns below

**Structure**:
```markdown
---
layout: two-cols-header
---

# Main Header for Both Columns

::left::

Left content

::right::

Right content
```

**Best For**:
- Related comparisons with shared context
- Grouped information
- Category breakdowns

---

### 7. image-left

**Purpose**: Image on left, content on right

**Structure**:
```markdown
---
layout: image-left
image: /assets/image.png
---

# Content Title

Content, bullets, or explanation here
```

**Best For**:
- Screenshots with explanations
- Diagrams with descriptions
- Visual references
- Product demos

**Customization**:
- `image`: Path to image
- `backgroundSize`: cover, contain

**Notes**:
- Image takes ~40% of slide
- Ensure image is high resolution
- Content should complement image

---

### 8. image-right

**Purpose**: Content on left, image on right

**Structure**:
```markdown
---
layout: image-right
image: /assets/image.png
---

# Content Title

Content, bullets, or explanation here
```

**Best For**:
- Same as image-left, mirrored
- Good for variety in presentation
- Natural reading flow (left to right)

---

### 9. image

**Purpose**: Full-screen image

**Structure**:
```markdown
---
layout: image
image: /assets/full-image.jpg
---
```

**Best For**:
- Powerful visuals
- Dramatic impact
- Visual breaks
- Photography

**Notes**:
- No text (or minimal overlay)
- High-quality images only
- Use sparingly

---

### 10. iframe

**Purpose**: Embed external content

**Structure**:
```markdown
---
layout: iframe
url: https://example.com
---
```

**Best For**:
- Live demos
- Web applications
- Interactive content
- External sites

**Notes**:
- Requires internet connection
- Test before presenting
- Consider fallback slides

---

### 11. iframe-left

**Purpose**: Iframe on left, content on right

**Structure**:
```markdown
---
layout: iframe-left
url: https://example.com
---

# Content

Explanation of embedded content
```

**Best For**:
- Demos with explanations
- Interactive examples
- Web tool showcases

---

### 12. iframe-right

**Purpose**: Content on left, iframe on right

**Structure**:
```markdown
---
layout: iframe-right
url: https://example.com
---

# Content

Explanation of embedded content
```

---

### 13. intro

**Purpose**: Introduction slides with metadata

**Structure**:
```markdown
---
layout: intro
---

# Presentation Title

## Subtitle

<div class="leading-8 opacity-80">
Presenter name<br>
Date<br>
Occasion
</div>
```

**Best For**:
- First slide alternatives
- Speaker introductions
- Conference talks

---

### 14. quote

**Purpose**: Quotations and attributions

**Structure**:
```markdown
---
layout: quote
---

# "Quote text goes here"

**— Author Name**

Optional context or explanation
```

**Best For**:
- Famous quotes
- Testimonials
- Key principles
- Emphasis

**Notes**:
- Keep quotes concise
- Always attribute
- Use for impact

---

### 15. fact

**Purpose**: Emphasize statistics or important data

**Structure**:
```markdown
---
layout: fact
---

# 87%

Teams report improved velocity after Scrum

<div class="text-sm opacity-75 mt-4">
Source: State of Agile Report 2024
</div>
```

**Best For**:
- Statistics
- Key metrics
- Important numbers
- Data points

**Notes**:
- Large, bold numbers
- Brief explanatory text
- Cite sources

---

### 16. statement

**Purpose**: Bold statements or affirmations

**Structure**:
```markdown
---
layout: statement
---

# Important Statement

A powerful declaration or key message
```

**Best For**:
- Key messages
- Principles
- Declarations
- Emphasis

---

### 17. end

**Purpose**: Closing slide

**Structure**:
```markdown
---
layout: end
---

# Thank You!

## Questions?

Contact: name@example.com
```

**Best For**:
- Final slide
- Q&A transition
- Contact information

---

### 18. full

**Purpose**: Full-screen content with no padding

**Structure**:
```markdown
---
layout: full
---

Full-screen content without default padding
```

**Best For**:
- Custom layouts
- Full-size diagrams
- Video embeds
- Special designs

---

### 19. none

**Purpose**: Completely blank slate

**Structure**:
```markdown
---
layout: none
---

Completely custom content - no default styling
```

**Best For**:
- Complete custom designs
- Special layouts
- Advanced use cases

---

## Layout Selection Decision Tree

```
START

Is this the first slide?
  YES → Use `cover`
  NO → Continue

Is this a section divider?
  YES → Use `section`
  NO → Continue

Does the slide have an image?
  YES → Is the image the main focus?
    YES → Use `image` (full-screen)
    NO → Use `image-left` or `image-right`
  NO → Continue

Does the slide have a quote?
  YES → Use `quote`
  NO → Continue

Does the slide emphasize a number/statistic?
  YES → Use `fact`
  NO → Continue

Does the slide need two columns?
  YES → Does it have a shared header?
    YES → Use `two-cols-header`
    NO → Use `two-cols`
  NO → Continue

Does the slide embed external content?
  YES → Needs description?
    YES → Use `iframe-left` or `iframe-right`
    NO → Use `iframe`
  NO → Continue

Should content be centered?
  YES → Use `center`
  NO → Use `default`

Is this the last slide?
  YES → Use `end`
  NO → Use selected layout
```

## Layout Combinations and Patterns

### Presentation Structure Pattern

```markdown
1. cover          # Title
2. default        # Agenda
3. section        # Section 1
4. default        # Content
5. two-cols       # Comparison
6. center         # Diagram
7. section        # Section 2
8. image-right    # Visual example
9. two-cols       # Code + Explanation
10. center        # Summary
11. end           # Thank you
```

### Training Material Pattern

```markdown
1. intro          # Title + Presenter
2. default        # Objectives
3. section        # Module 1
4. default        # Theory
5. image-left     # Visual example
6. two-cols       # Do's vs Don'ts
7. center         # Diagram
8. quote          # Key principle
9. section        # Module 2
...
N-1. center       # Key Takeaways
N. end            # Q&A
```

### Technical Talk Pattern

```markdown
1. cover          # Title
2. intro          # Speaker intro
3. default        # Problem statement
4. section        # Solution
5. two-cols       # Code + Explanation
6. iframe-right   # Live demo
7. center         # Architecture diagram
8. fact           # Performance metrics
9. center         # Summary
10. end           # Contact
```

## Best Practices by Layout

### Cover Slides
- ✅ High-quality background images
- ✅ Strong contrast for readability
- ✅ Minimal text (title + subtitle)
- ❌ Don't clutter with too much info
- ❌ Avoid busy backgrounds

### Content Slides (default, center)
- ✅ One main idea per slide
- ✅ 3-7 bullet points max
- ✅ Use progressive disclosure (<v-clicks>)
- ❌ Don't cram too much content
- ❌ Avoid long paragraphs

### Two-Column Slides
- ✅ Balance content between columns
- ✅ Use for comparisons and contrasts
- ✅ Keep text concise
- ❌ Don't make columns too different in length
- ❌ Avoid tiny text

### Image Slides
- ✅ High-resolution images (1920x1080 min)
- ✅ Relevant to content
- ✅ Proper attribution
- ❌ Don't use stretched/pixelated images
- ❌ Avoid generic stock photos

### Diagram Slides (center)
- ✅ Simple, focused diagrams
- ✅ Clear labels and flow
- ✅ Appropriate size/scale
- ❌ Don't make diagrams too complex
- ❌ Avoid tiny text in diagrams

### Section Dividers
- ✅ Use consistently
- ✅ Match presentation theme
- ✅ Brief and clear
- ❌ Don't overuse
- ❌ Avoid long descriptions

## Layout Customization

### Adding Custom Classes

```markdown
---
layout: center
class: text-2xl font-bold text-blue-600
---

# Custom Styled Content
```

### Background Options

```markdown
---
layout: cover
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
---
```

```markdown
---
layout: section
background: /assets/bg.jpg
backgroundSize: cover
---
```

### Combining Layouts with Components

```markdown
---
layout: two-cols
---

# Code Example

<v-clicks>

- Point 1
- Point 2

</v-clicks>

::right::

\`\`\`python
def example():
    return "Hello"
\`\`\`
```

## Common Layout Issues and Solutions

### Issue: Content Overflow

**Problem**: Too much content doesn't fit on slide

**Solutions**:
1. Split into multiple slides
2. Use two-cols layout
3. Reduce font size (sparingly)
4. Remove non-essential content

### Issue: Image Not Displaying

**Problem**: Image doesn't show in image layouts

**Solutions**:
1. Check file path (relative to slides.md)
2. Ensure image is in public/ or assets/
3. Use correct format (jpg, png, svg)
4. Check image permissions

### Issue: Layout Not Applying

**Problem**: Layout doesn't look right

**Solutions**:
1. Verify layout name spelling
2. Check for blank lines around `---`
3. Validate YAML frontmatter
4. Test with default layout first

### Issue: Columns Unbalanced

**Problem**: Two-cols layout looks awkward

**Solutions**:
1. Balance content length
2. Use images to fill space
3. Adjust font sizes
4. Consider alternative layout

## Quick Reference Table

| Layout | Use Case | Key Feature | Difficulty |
|--------|----------|-------------|------------|
| cover | Title slides | Full background | Easy |
| default | General content | Standard format | Easy |
| center | Emphasis | Centered text | Easy |
| section | Dividers | Visual break | Easy |
| two-cols | Comparison | Split view | Easy |
| image-left/right | Visual + text | Image integration | Easy |
| image | Visual impact | Full-screen | Easy |
| quote | Quotations | Attribution | Easy |
| fact | Statistics | Big numbers | Easy |
| end | Closing | Contact info | Easy |
| iframe | Embedded | External content | Medium |
| intro | Speaker intro | Metadata display | Medium |
| two-cols-header | Grouped comparison | Shared header | Medium |
| full | Custom | No padding | Advanced |
| none | Blank canvas | Complete custom | Advanced |

## Layout Testing Checklist

Before finalizing presentation:

- [ ] All layouts render correctly
- [ ] Images load properly
- [ ] Two-column content is balanced
- [ ] Text is readable (not too small)
- [ ] Backgrounds have good contrast
- [ ] Diagrams fit within slides
- [ ] Code blocks are formatted
- [ ] Iframe content loads
- [ ] Animations work smoothly
- [ ] Mobile/responsive display OK

---

**Pro Tip**: When in doubt, start with `default` or `center` layouts. They're versatile and work for most content. You can always refactor to more specific layouts later.

Use this guide when selecting layouts during slide generation to ensure optimal presentation structure and visual hierarchy.
