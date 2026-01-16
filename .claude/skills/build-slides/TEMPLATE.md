# Slidev Slide Templates Reference

This file contains reusable slide templates and patterns for generating Slidev presentations. Use these templates as building blocks when creating presentations.

## Frontmatter Configuration

### Standard Frontmatter

```markdown
---
theme: apple-basic
title: Presentation Title
info: |
  ## Presentation Title
  Brief description of the presentation

  Created with Claude Code build-slides skill
background: /assets/hero-bg.jpg
class: text-center
highlighter: shiki
lineNumbers: true
drawings:
  persist: false
transition: slide-left
mdc: true
---
```

### Theme Options

```yaml
theme: apple-basic     # Clean, professional (recommended for training)
theme: default         # Developer-friendly
theme: seriph          # Corporate, polished
theme: bricks          # Minimal, simple
```

### Additional Configuration Options

```yaml
# Custom CSS
css: unocss

# Download button
download: true
exportFilename: my-presentation

# Logo configuration
themeConfig:
  logo: /assets/logo.png
  footer: "© 2024 Company Name"

# Code highlighting
highlighter: shiki     # Recommended
lineNumbers: true      # Show line numbers in code blocks

# Drawing/annotations
drawings:
  persist: false       # Don't save drawings between sessions
  presenterOnly: false # Allow audience to see drawings

# Transitions
transition: slide-left  # Options: slide-left, slide-right, slide-up, fade, none
```

## Slide Templates

### 1. Cover/Title Slide

```markdown
---
layout: cover
background: /assets/hero-bg.jpg
class: text-center
---

# Presentation Title

Subtitle or Brief Description

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  <a href="https://github.com/username" target="_blank" alt="GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>

<!--
Welcome and introduction
TIMING: 2 minutes
INTERACTION: Introduce yourself and set context
-->

---
```

### 2. Agenda/Table of Contents

```markdown
# Agenda

<v-clicks>

- 📝 Topic 1: Brief description
- 🔧 Topic 2: Brief description
- 📊 Topic 3: Brief description
- 🎯 Topic 4: Brief description
- 💡 Topic 5: Brief description

</v-clicks>

<!--
Overview of what we'll cover
TIMING: 1-2 minutes
-->

---
```

Alternative with Toc component:

```markdown
---
layout: center
---

# Table of Contents

<Toc />

<!--
Automatically generated from section slides
-->

---
```

### 3. Section Divider

```markdown
---
layout: section
background: /assets/section-bg.jpg
---

# Section Name

Brief section description or tagline

<!--
Transition to new major section
TIMING: 30 seconds
-->

---
```

### 4. Standard Content Slide

```markdown
---
layout: default
---

# Slide Title

## Subtitle (optional)

Content goes here with bullet points:

- Point 1
- Point 2
- Point 3

You can also use paragraphs for longer explanations.

<!--
Main talking points
TIMING: 3 minutes
KEY POINTS: [List key takeaways]
-->

---
```

### 5. Centered Content

```markdown
---
layout: center
class: text-center
---

# Centered Slide Title

## Subtitle

Centered content works well for emphasis or quotes

<!--
Use for important concepts or transitions
-->

---
```

### 6. Content with Progressive Disclosure

```markdown
# Slide Title

<v-clicks>

- First point (click to reveal)
- Second point (click to reveal)
- Third point (click to reveal)
- Fourth point (click to reveal)

</v-clicks>

<!--
Reveal points one by one to maintain focus
TIMING: 4 minutes (1 min per point)
-->

---
```

### 7. Two-Column Layout

```markdown
---
layout: two-cols
---

# Left Column Title

Content for the left side:

- Point 1
- Point 2
- Point 3

Additional text or information.

::right::

# Right Column Title

Content for the right side:

- Point A
- Point B
- Point C

Additional text or information.

<!--
Compare/contrast or show complementary information
TIMING: 4 minutes
-->

---
```

### 8. Two-Column with Progressive Disclosure

```markdown
---
layout: two-cols
---

# Do's ✅

<v-clicks>

- Keep it under 15 minutes
- Stand up (if possible)
- Focus on commitments
- Identify blockers

</v-clicks>

::right::

# Don'ts ❌

<v-clicks>

- Solve problems in standup
- Report to the Scrum Master
- Discuss implementation details
- Go over time

</v-clicks>

<!--
Emphasize contrasts with progressive reveals
TIMING: 5 minutes
INTERACTION: Ask "Which have you seen in practice?"
-->

---
```

### 9. Code Block (Simple)

```markdown
# Code Example

\`\`\`python
def calculate_velocity(story_points, sprint_days):
    """Calculate team velocity"""
    return story_points / sprint_days

# Example usage
velocity = calculate_velocity(40, 10)
print(f"Team velocity: {velocity} points/day")
\`\`\`

<!--
Explain the code and its purpose
TIMING: 3 minutes
-->

---
```

### 10. Code Block with Line Highlighting

```markdown
# Code Example with Highlighting

\`\`\`python {all|1-2|4-5|7-8|all}
def calculate_velocity(story_points, sprint_days):
    """Calculate team velocity"""

    if sprint_days == 0:
        return 0

    velocity = story_points / sprint_days
    return velocity

# Example usage
velocity = calculate_velocity(40, 10)
print(f"Team velocity: {velocity} points/day")
\`\`\`

<!--
Walk through code step by step:
- Lines 1-2: Function definition
- Lines 4-5: Edge case handling
- Lines 7-8: Calculation logic
TIMING: 5 minutes
-->

---
```

### 11. Code with Explanation (Two-Column)

```markdown
---
layout: two-cols
---

# Understanding the Code

This function calculates team velocity based on story points completed and sprint duration.

**Key Concepts**:
- Velocity = Points / Days
- Tracks team performance
- Helps with sprint planning

**Usage**:
- Call after sprint completion
- Use for next sprint estimates

::right::

\`\`\`python {all|1-2|4|6-7|all}
def calculate_velocity(
    story_points, sprint_days):
    """Calculate team velocity"""

    if sprint_days == 0:
        return 0

    velocity = story_points / sprint_days
    return round(velocity, 2)

# Usage
velocity = calculate_velocity(40, 10)
print(f"Velocity: {velocity}")
\`\`\`

<!--
Line-by-line walkthrough:
- Function accepts two parameters
- Edge case: prevent division by zero
- Calculate and return rounded value
TIMING: 5-6 minutes
-->

---
```

### 12. Multiple Code Blocks

```markdown
# Code Comparison

**Before**:
\`\`\`python
# Old approach
total = 0
for item in items:
    total += item.price
\`\`\`

**After**:
\`\`\`python
# New approach with list comprehension
total = sum(item.price for item in items)
\`\`\`

<!--
Highlight improvements in the refactored code
TIMING: 4 minutes
-->

---
```

### 13. Flowchart Diagram

```markdown
---
layout: center
---

# Process Flow

\`\`\`mermaid {theme: 'neutral', scale: 0.8}
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
    style A fill:#90EE90
    style E fill:#FFB6C6
\`\`\`

<!--
Walk through the process flow:
- Start with initial state
- Decision point determines path
- Both paths lead to completion
TIMING: 4 minutes
-->

---
```

### 14. Sequence Diagram

```markdown
---
layout: center
---

# Interaction Flow

\`\`\`mermaid {theme: 'neutral', scale: 0.9}
sequenceDiagram
    participant User
    participant System
    participant Database

    User->>System: Request Data
    System->>Database: Query
    Database-->>System: Results
    System-->>User: Display Results
\`\`\`

<!--
Explain the interaction pattern:
- User initiates request
- System processes and queries database
- Results flow back through system to user
TIMING: 4 minutes
-->

---
```

### 15. Sprint Cycle Diagram

```markdown
---
layout: center
---

# Scrum Sprint Cycle

\`\`\`mermaid {theme: 'neutral', scale: 0.8}
graph LR
    A[Product Backlog] -->|Sprint Planning| B[Sprint Backlog]
    B -->|Daily Work| C[Increment]
    C -->|Sprint Review| D[Feedback]
    D -->|Retrospective| E[Improvements]
    E -->|Apply| A

    style A fill:#E3F2FD
    style B fill:#FFF3E0
    style C fill:#E8F5E9
    style D fill:#FCE4EC
    style E fill:#F3E5F5
\`\`\`

<!--
Explain the iterative nature of Scrum:
- Planning: Select items from product backlog
- Execution: Daily work creates increment
- Review: Gather feedback on increment
- Retrospective: Identify improvements
- Apply learnings to next sprint
TIMING: 5 minutes
-->

---
```

### 16. Gantt Chart

```markdown
---
layout: center
---

# Sprint Timeline

\`\`\`mermaid
gantt
    title Sprint Timeline
    dateFormat  YYYY-MM-DD
    section Sprint
    Sprint Planning     :2024-01-01, 1d
    Development         :2024-01-02, 8d
    Sprint Review       :2024-01-10, 1d
    Retrospective       :2024-01-10, 1d
\`\`\`

<!--
Show typical sprint timeline and activities
TIMING: 3 minutes
-->

---
```

### 17. Pie Chart

```markdown
---
layout: center
---

# Time Distribution

\`\`\`mermaid
pie title Sprint Time Allocation
    "Development" : 60
    "Meetings" : 20
    "Planning" : 10
    "Testing" : 10
\`\`\`

<!--
Discuss ideal time allocation in a sprint
TIMING: 3 minutes
-->

---
```

### 18. Quote/Callout

```markdown
---
layout: quote
---

# "Important Quote or Statement"

**— Author Name**

Additional context or explanation about the quote.

<!--
Emphasize key principle or philosophy
TIMING: 2 minutes
-->

---
```

### 19. Fact/Statistics

```markdown
---
layout: fact
---

# 87%

Teams report improved velocity after implementing Scrum

<!--
Highlight important statistics
TIMING: 2 minutes
SOURCE: [Cite source]
-->

---
```

### 20. Image Left

```markdown
---
layout: image-left
image: /assets/diagram.png
---

# Content with Image

The image appears on the left side of the slide.

Content, bullet points, or explanations go here:

- Point 1
- Point 2
- Point 3

<!--
Use when image supports the content
TIMING: 3 minutes
-->

---
```

### 21. Image Right

```markdown
---
layout: image-right
image: /assets/screenshot.png
---

# Content with Image

The image appears on the right side of the slide.

**Key Points**:
- Visual reference on the right
- Content explanation on the left
- Good for screenshots or diagrams

<!--
Image provides visual context for the content
TIMING: 3 minutes
-->

---
```

### 22. Full-Screen Image

```markdown
---
layout: image
image: /assets/full-screen.jpg
---

<!--
Powerful visual without distractions
Let the image speak
TIMING: 1 minute
-->

---
```

### 23. Iframe (Embedded Content)

```markdown
---
layout: iframe
url: https://example.com
---

<!--
Embed live website or web app
TIMING: Variable
-->

---
```

### 24. Comparison Table

```markdown
# Feature Comparison

| Feature | Option A | Option B |
|---------|----------|----------|
| Speed | Fast | Moderate |
| Cost | $$ | $ |
| Ease | Easy | Complex |
| Support | Excellent | Good |

<!--
Compare options side by side
TIMING: 4 minutes
-->

---
```

### 25. Key Takeaways

```markdown
---
layout: center
class: text-center
---

# Key Takeaways

<v-clicks>

## 🎯 Takeaway 1
Brief description of main point

## 💡 Takeaway 2
Brief description of main point

## ✨ Takeaway 3
Brief description of main point

</v-clicks>

<!--
Summarize the main points
TIMING: 3 minutes
INTERACTION: Ask "Any questions on these points?"
-->

---
```

### 26. Summary Slide

```markdown
# Summary

Let's recap what we covered:

<v-clicks>

1. **Topic 1**: Key learning
2. **Topic 2**: Key learning
3. **Topic 3**: Key learning
4. **Topic 4**: Key learning

</v-clicks>

**Next Steps**: [Action items or recommendations]

<!--
Reinforce main concepts
TIMING: 3 minutes
-->

---
```

### 27. Thank You / End Slide

```markdown
---
layout: end
---

# Thank You!

## Questions?

**Contact Information**:
- Email: name@example.com
- Website: example.com
- GitHub: @username

**Resources**:
- [Link 1](https://example.com)
- [Link 2](https://example.com)

<!--
Open for Q&A
TIMING: Remaining time
-->
```

### 28. Q&A Slide

```markdown
---
layout: center
class: text-center
---

# Questions & Answers

<div class="text-6xl mt-12">
❓
</div>

<!--
Field questions from audience
Address concerns
Clarify concepts
-->

---
```

### 29. Interactive Quiz

```markdown
# Quick Quiz

**Question**: What are the three questions in a Daily Standup?

<v-clicks>

1. ✅ What did I do yesterday?
2. ✅ What will I do today?
3. ✅ Any blockers?
4. ❌ What's my status for the PM? (This is NOT a standup question!)

</v-clicks>

<!--
Test knowledge retention
TIMING: 3 minutes
INTERACTION: Ask for audience answers before revealing
-->

---
```

### 30. Call to Action

```markdown
---
layout: center
class: text-center
---

# Let's Get Started!

<div class="mt-8">

## Try It Today

1. Install Slidev
2. Create your first deck
3. Share your presentation

</div>

<div class="mt-12">
  <button class="px-6 py-3 bg-blue-600 text-white rounded-lg text-xl">
    Get Started →
  </button>
</div>

<!--
Motivate action
TIMING: 2 minutes
-->

---
```

## Custom Styling Examples

### Slide-Specific Styling

```markdown
---
layout: center
---

# Custom Styled Slide

<div class="text-blue-600 text-4xl font-bold mb-4">
  Large Blue Text
</div>

<div class="bg-yellow-100 p-4 rounded-lg">
  Highlighted Box
</div>

<style scoped>
/* Slide-specific styles */
h1 {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>

---
```

### Global Custom Styles

Add to frontmatter or end of slides.md:

```markdown
<style>
.slidev-layout {
  @apply text-xl;
}

.slidev-code {
  @apply text-sm leading-relaxed;
}

/* Custom utility classes */
.highlight-box {
  @apply bg-yellow-200 border-2 border-yellow-400 p-4 rounded-lg;
}

.success {
  @apply text-green-600 font-bold;
}

.warning {
  @apply text-orange-600 font-bold;
}

.error {
  @apply text-red-600 font-bold;
}
</style>
```

## Animation Patterns

### 1. List with Click-to-Reveal

```markdown
<v-clicks>

- Item 1
- Item 2
- Item 3

</v-clicks>
```

### 2. Individual Element Reveals

```markdown
<v-click>

First element revealed

</v-click>

<v-click>

Second element revealed

</v-click>
```

### 3. Conditional Visibility

```markdown
<v-click at="1">

Appears on first click

</v-click>

<v-click at="2">

Appears on second click

</v-click>
```

### 4. Code Line Highlighting

```markdown
\`\`\`python {all|1|2-4|5|all}
line 1
line 2
line 3
line 4
line 5
\`\`\`
```

Patterns:
- `{all}` - Show all lines
- `{1}` - Highlight line 1
- `{2-4}` - Highlight lines 2-4
- `{1,5}` - Highlight lines 1 and 5
- `{all|1|2-4|5|all}` - Progressive highlighting sequence

### 5. VAfter (Timed Reveals)

```markdown
<VAfter>

Content that appears after previous animations

</VAfter>
```

## Presenter Notes Best Practices

### Standard Note Format

```markdown
<!--
[Main talking points]

TIMING: [X minutes]

KEY POINTS:
- Point 1
- Point 2

INTERACTION:
- Question to ask audience
- Activity or engagement

TRANSITIONS:
- Link to next slide
-->
```

### Example Comprehensive Notes

```markdown
<!--
Explain the Scrum sprint cycle diagram in detail.

TIMING: 5 minutes

KEY POINTS:
- Sprint is a fixed time-box (usually 2 weeks)
- Starts with planning, ends with review and retrospective
- Continuous improvement through feedback loops

INTERACTION:
- Ask: "How long are your sprints?"
- Poll: "Who uses 1-week vs 2-week sprints?"

TRANSITIONS:
- "Now that we understand the overall cycle, let's dive into each ceremony in detail"

TROUBLESHOOTING:
- If questions about backlog refinement, mention it happens during sprint
- Common confusion: Review vs Retrospective (Review = product, Retro = process)
-->
```

## Component Usage

### Built-in Components

```markdown
<!-- Table of Contents -->
<Toc />

<!-- Current Slide Number -->
<SlideCurrentNo />

<!-- Total Slides -->
<SlidesTotal />

<!-- YouTube Embed -->
<Youtube id="video-id" />

<!-- Twitter Embed -->
<Tweet id="tweet-id" />

<!-- Auto-fit text to container -->
<AutoFitText :max="200" :min="100">
  Long text that auto-sizes
</AutoFitText>
```

### Links

```markdown
<!-- Internal link to slide -->
<Link to="5">Go to slide 5</Link>

<!-- External link -->
[External Link](https://example.com)
```

## Tips for Using Templates

1. **Copy Entire Sections**: Include frontmatter + content + notes
2. **Customize Content**: Replace placeholders with actual content
3. **Maintain Consistency**: Use same layouts for similar content types
4. **Test Animations**: Preview to ensure animations work as intended
5. **Check Line Lengths**: Keep code blocks under 80 characters wide
6. **Validate Diagrams**: Test Mermaid syntax before including
7. **Add Presenter Notes**: Never skip notes - they're essential for delivery

## Template Selection Guide

| Content Type | Recommended Template | Layout |
|--------------|---------------------|---------|
| Title | Cover Slide | `cover` |
| Overview | Agenda | `default` |
| Section Start | Section Divider | `section` |
| Explanation | Standard Content | `default` |
| Emphasis | Centered Content | `center` |
| Comparison | Two-Column | `two-cols` |
| Code Only | Code Block Simple | `default` |
| Code + Explain | Code with Explanation | `two-cols` |
| Process | Flowchart Diagram | `center` |
| Interaction | Sequence Diagram | `center` |
| Timeline | Gantt Chart | `center` |
| Statistics | Pie Chart / Fact | `center` / `fact` |
| Quote | Quote/Callout | `quote` |
| Visual | Image Slides | `image-left/right` |
| Summary | Key Takeaways | `center` |
| Ending | Thank You / Q&A | `end` |

---

**Usage**: Read this file when generating presentations to select and customize appropriate templates for each slide type.
