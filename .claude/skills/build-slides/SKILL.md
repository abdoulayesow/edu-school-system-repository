---
name: build-slides
description: Build professional Slidev presentations from conversational input. Supports code examples, diagrams, animations, and presenter notes. Ideal for training materials, technical talks, and documentation.
model: sonnet
triggers:
  - slides
  - presentation
  - slidev
  - deck
  - training slides
  - build slides
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# Build Slides - Professional Slidev Presentation Generator

Generate professional, developer-friendly presentations using Slidev from conversational input. Perfect for training materials, technical talks, documentation, and educational content.

## What This Skill Does

This skill transforms your natural language descriptions into beautiful Slidev presentations with:

- **Full Project Setup**: Installs and configures Slidev automatically
- **Code Examples**: Syntax-highlighted code blocks with step-by-step reveals
- **Diagrams**: Mermaid flowcharts, sequence diagrams, and charts
- **Animations**: Progressive disclosure and click-to-reveal elements
- **Presenter Notes**: Hidden notes for speakers with timing and facilitation tips
- **Export**: PDF, PPTX, and PNG export capabilities

## When This Skill Activates

The skill automatically activates when you mention:
- "slides" / "presentation" / "deck"
- "training slides" / "build slides"
- "slidev"

Or invoke directly: `/build-slides`

## Usage

### Quick Start

```
/build-slides
```

Then describe what you want to create:

```
I need training slides for Scrum Masters covering sprint planning, daily standups,
sprint review, and retrospectives. Include diagrams showing the process flow.
```

### With Arguments

```
/build-slides --title "My Presentation" --topic "Feature description"
```

### Update Existing

```
/build-slides --update
Add a section about distributed teams after the standup section
```

## Implementation Process

### Step 1: Environment Detection

**ALWAYS start by detecting the project mode:**

```bash
# Check for existing slides
if [ -f "slides.md" ]; then
  mode="update"
elif grep -q "@slidev/cli" package.json 2>/dev/null; then
  mode="existing_project"
else
  mode="new_project"
fi
```

**Actions by Mode**:

**New Project** (`mode="new_project"`):
1. Ask user for project name (default: "presentation")
2. Run: `npm create slidev@latest [project-name]` (use pnpm if available)
3. Wait for installation to complete
4. Navigate into project directory
5. Proceed to Step 2

**Existing Project** (`mode="existing_project"`):
1. Create `presentations/` directory if it doesn't exist
2. Ask user for presentation name
3. Create `presentations/[name]/` subdirectory
4. Add Slidev scripts to package.json if not present
5. Proceed to Step 2

**Update Mode** (`mode="update"`):
1. Read existing `slides.md` file
2. Parse structure (sections, slide counts)
3. Ask user what to add/modify
4. Jump to Step 3 with update context

### Step 2: Gather Requirements

**Ask the user (if not already provided):**

1. **Topic/Title**: "What's the main topic of your presentation?"
2. **Content**: "What topics or sections should be covered?"
3. **Audience**: "Who is the target audience?" (helps with depth/style)
4. **Length**: "Roughly how many slides? (optional)"
5. **Special Features**: "Any specific needs? (code examples, diagrams, animations)"

**Parse the input for:**
- Main topic and subtopics
- Keywords indicating content type (process→diagram, code→code blocks, compare→two-cols)
- Domain-specific terms (Scrum, agile, technical terms)
- Requested special elements

### Step 3: Parse Input into Structure

**Use this algorithm to structure content:**

#### 3.1 Topic Extraction

```
Extract main_title from user input (first major concept mentioned)
Extract subtitle if present
Identify all subtopics and major concepts
Build hierarchical structure
```

#### 3.2 Content Classification

Map user input to slide types:

| User Input Indicators | Slide Type | Layout |
|----------------------|------------|--------|
| Lists, bullets, points | Content | `default` or `center` |
| Process, flow, steps, cycle | Diagram | `center` with Mermaid |
| Code, function, script, program | Code | `two-cols` (explain + code) |
| Compare, vs, difference, contrast | Comparison | `two-cols` |
| Definition, meaning, concept | Definition | `quote` or `center` |
| Statistics, numbers, metrics | Visual emphasis | `fact` or `center` |
| Image, photo, screenshot | Image-focused | `image-left/right` |

#### 3.3 Slide Count Estimation

```
base_slides = 2  # Title + Agenda
section_transition_slides = number_of_sections
content_slides = sections * 3 to 5  # Depends on depth
conclusion_slides = 2  # Summary + Q&A
total_estimate = base_slides + section_transition_slides + content_slides + conclusion_slides
total_with_buffer = total_estimate * 1.2  # 20% buffer
```

#### 3.4 Structure Output

Create a structure like:

```json
{
  "title": "Scrum Master Training",
  "subtitle": "Sprint Ceremonies and Best Practices",
  "theme": "apple-basic",
  "sections": [
    {
      "name": "Introduction",
      "slides": [
        {"type": "cover", "content": "Title slide"},
        {"type": "agenda", "content": "Overview of topics"}
      ]
    },
    {
      "name": "Sprint Planning",
      "slides": [
        {"type": "section", "content": "Sprint Planning"},
        {"type": "bullets", "content": "Purpose and goals"},
        {"type": "two-cols", "content": "Process steps"},
        {"type": "diagram", "diagramType": "flowchart", "content": "Planning flow"},
        {"type": "bullets", "content": "Common pitfalls"}
      ]
    }
  ],
  "features": {
    "code": false,
    "diagrams": ["flowchart", "sequence"],
    "animations": true,
    "presenterNotes": true
  }
}
```

### Step 4: Generate Presentation Content

#### 4.1 Read Templates

**ALWAYS read the template files first:**

```bash
# Read base templates
Read: .claude/skills/build-slides/TEMPLATE.md
Read: .claude/skills/build-slides/templates/presentation-starter.md

# Read domain-specific templates if applicable
if topic includes "scrum" or "agile":
  Read: .claude/skills/build-slides/templates/scrum-training.md

if features.code:
  Read: .claude/skills/build-slides/templates/code-showcase.md

if features.diagrams:
  Read: .claude/skills/build-slides/templates/diagram-patterns.md

# Read layout reference
Read: .claude/skills/build-slides/guides/slidev-layouts.md

# Read content strategies
Read: .claude/skills/build-slides/guides/content-strategies.md
```

#### 4.2 Generate Frontmatter

```markdown
---
theme: apple-basic
title: [Presentation Title]
info: |
  ## [Presentation Title]
  [Brief description]

  Created with Claude Code build-slides skill
class: text-center
highlighter: shiki
lineNumbers: true
drawings:
  persist: false
transition: slide-left
mdc: true
---
```

**Theme Selection**:
- Training/Educational → `apple-basic`
- Technical/Developer → `default`
- Corporate/Professional → `seriph`
- Minimal/Simple → `bricks`

#### 4.3 Generate Slides

For each slide in the structure:

**Cover Slide**:
```markdown
# [Title]

[Subtitle]

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

<!--
[Opening presenter notes with timing]
TIMING: 2 minutes
INTERACTION: Welcome, introduce yourself
-->

---
```

**Agenda Slide**:
```markdown
# Agenda

<v-clicks>

- [Topic 1]
- [Topic 2]
- [Topic 3]
- [Topic 4]

</v-clicks>

<!--
Preview the topics we'll cover
TIMING: 1 minute
-->

---
```

**Section Transition**:
```markdown
---
layout: section
---

# [Section Name]

<!--
Transition to new section
-->

---
```

**Content Slide (Bullets)**:
```markdown
# [Slide Title]

<v-clicks>

- [Point 1]
- [Point 2]
- [Point 3]

</v-clicks>

<!--
[Presenter notes]
TIMING: 3-4 minutes
KEY POINTS: [Main takeaways]
-->

---
```

**Code Slide (Two-Column)**:
```markdown
---
layout: two-cols
---

# [Title]

[Explanation of what the code does]

**Key Concepts**:
- [Concept 1]
- [Concept 2]

::right::

\`\`\`[language] {all|1|2-4|5|all}
[code line 1]
[code line 2]
[code line 3]
[code line 4]
[code line 5]
\`\`\`

<!--
Walk through code line by line:
- Line 1: [explanation]
- Lines 2-4: [explanation]
- Line 5: [explanation]
TIMING: 5 minutes
-->

---
```

**Diagram Slide**:
```markdown
---
layout: center
---

# [Diagram Title]

\`\`\`mermaid {theme: 'neutral', scale: 0.8}
[mermaid diagram code]
\`\`\`

<!--
Walk through the diagram:
- [Component 1]: [explanation]
- [Component 2]: [explanation]
TIMING: 4 minutes
-->

---
```

**Two-Column Comparison**:
```markdown
---
layout: two-cols
---

# [Left Side Title]

<v-clicks>

- [Point 1]
- [Point 2]
- [Point 3]

</v-clicks>

::right::

# [Right Side Title]

<v-clicks>

- [Point 1]
- [Point 2]
- [Point 3]

</v-clicks>

<!--
Highlight the differences
TIMING: 3 minutes
-->

---
```

**Summary Slide**:
```markdown
---
layout: center
class: text-center
---

# Key Takeaways

<v-clicks>

## [Takeaway 1]
[Brief description]

## [Takeaway 2]
[Brief description]

## [Takeaway 3]
[Brief description]

</v-clicks>

<!--
Reinforce main points
TIMING: 2 minutes
-->

---
```

**End Slide**:
```markdown
---
layout: end
---

# Thank You!

## Questions?

[Contact Information]
[Resources/Links]

<!--
Open for Q&A
TIMING: Remaining time
-->
```

#### 4.4 Content Enrichment Rules

**Code Examples**:
- Keep code under 20 lines per slide
- Use line highlighting: `{all|1|2-4|5|all}` for step-by-step
- Add comments for clarity
- Use two-column layout for code + explanation
- Common languages: python, javascript, typescript, java, csharp, go, rust

**Diagrams (Mermaid)**:
- Keep diagrams simple (max 15 nodes)
- Use appropriate diagram types:
  - `graph TD` / `graph LR` - Flowcharts
  - `sequenceDiagram` - Interactions
  - `gantt` - Timelines
  - `pie` / `bar` - Statistics
- Add theme and scale: `{theme: 'neutral', scale: 0.8}`
- Use descriptive node labels

**Animations**:
- Use `<v-clicks>` for lists (reveals all items one by one)
- Use `<v-click>` for individual elements
- Code highlighting: `{all|1|2-4|5|all}` pattern
- Don't overuse - animations should enhance, not distract

**Presenter Notes**:
ALWAYS add presenter notes to EVERY slide with:
```html
<!--
[Main talking points]
TIMING: [X minutes]
KEY POINTS: [Critical information]
INTERACTION: [Audience engagement prompts]
-->
```

### Step 5: Write Files

#### 5.1 Write slides.md

```bash
Write: [project-path]/slides.md
Content: [All generated content from Step 4]
```

#### 5.2 Create Additional Files

**For New Projects**:

**package.json** (if not auto-created):
```json
{
  "name": "[project-name]",
  "type": "module",
  "scripts": {
    "dev": "slidev",
    "build": "slidev build",
    "export": "slidev export",
    "export-pdf": "slidev export --format pdf",
    "export-pptx": "slidev export --format pptx"
  },
  "dependencies": {
    "@slidev/cli": "^0.49.0",
    "@slidev/theme-apple-basic": "^0.24.0"
  },
  "devDependencies": {
    "playwright-chromium": "^1.40.0"
  }
}
```

**README.md**:
```markdown
# [Presentation Title]

[Description]

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Export

\`\`\`bash
# PDF
npm run export-pdf

# PowerPoint
npm run export-pptx
\`\`\`

## Features

- [Feature 1]
- [Feature 2]

Created with Claude Code `build-slides` skill.
```

**.gitignore**:
```
node_modules/
.slidev/
dist/
*.pdf
*.pptx
.DS_Store
```

**assets/.gitkeep**:
```
# Place images and assets here
```

#### 5.3 Update Existing Project

If `mode="existing_project"`:

**Update package.json** (add scripts):
```json
{
  "scripts": {
    "slides:dev": "slidev presentations/[name]/slides.md",
    "slides:build": "slidev build presentations/[name]/slides.md",
    "slides:export": "slidev export presentations/[name]/slides.md"
  }
}
```

### Step 6: Verification

**Run automated checks:**

```bash
# 1. Navigate to project
cd [project-path]

# 2. Install dependencies (if new project)
if [ ! -d "node_modules" ]; then
  npm install
fi

# 3. Validate slides.md syntax
npx slidev format slides.md

# 4. Check for common issues
# - Unclosed code blocks
# - Invalid Mermaid syntax
# - Broken layout declarations
grep -E '```[a-z]*$' slides.md  # Check for code blocks
grep -E '^---$' slides.md | wc -l  # Count slide separators
```

**Report to user:**

```
✅ Presentation Generated Successfully!

📁 Location: ./[project-path]/slides.md
📊 Slides: [X] total
✨ Features:
  ✓ Code examples ([language])
  ✓ Mermaid diagrams ([types])
  ✓ Animations ([count] slides)
  ✓ Presenter notes (all slides)

🚀 Next Steps:

1. Preview (with hot reload):
   cd [project-path]
   npm run dev

2. Export to PDF:
   npm run export-pdf

3. Export to PowerPoint:
   npm run export-pptx

💡 Tips:
- Edit slides.md to customize content
- Add images to assets/ directory
- Use presenter mode: press 'O' in browser
- View presenter notes in presenter mode

Would you like me to:
1. Start the dev server now
2. Make adjustments to the slides
3. Export to PDF/PPTX
```

### Step 7: Iteration (If Requested)

If user requests changes:

```bash
# Read current slides.md
Read: [project-path]/slides.md

# Parse user request
- "Add section about [topic]" → Generate new slides, insert at appropriate location
- "Make code larger" → Update CSS in frontmatter
- "Change theme to [theme]" → Update theme in frontmatter
- "Add more diagrams" → Generate Mermaid diagrams for relevant slides

# Apply changes
Edit: [project-path]/slides.md

# Re-validate
npx slidev format slides.md

# Report changes
"✅ Updated: [description of changes]"
```

## Domain-Specific Knowledge

### Scrum Master Training

When the topic includes "scrum", "agile", "sprint", or related terms:

**ALWAYS read**: `.claude/skills/build-slides/templates/scrum-training.md`

**Pre-built content for**:
- Sprint ceremonies (Planning, Standup, Review, Retrospective)
- Artifacts (Product Backlog, Sprint Backlog, Increment)
- Roles (Product Owner, Scrum Master, Development Team)
- Metrics (Velocity, Burndown, Cycle Time)

**Pre-built diagrams**:
- Sprint cycle flow
- Scrum process overview
- Burndown chart template
- Backlog refinement sequence

### Technical Presentations

When the topic includes code, programming, or technical concepts:

**ALWAYS read**: `.claude/skills/build-slides/templates/code-showcase.md`

**Focus on**:
- Two-column layouts (explanation + code)
- Syntax highlighting
- Step-by-step code reveals
- Live code examples (where possible)

## Error Handling

### Missing Dependencies

**If Slidev not available:**
```bash
echo "Slidev not found. Installing..."

# Check for package manager
if command -v pnpm &> /dev/null; then
  pnpm create slidev@latest [project-name]
elif command -v npm &> /dev/null; then
  npm create slidev@latest [project-name]
else
  echo "❌ Error: npm not found. Please install Node.js first."
  exit 1
fi
```

**If Playwright missing (for PDF export):**
```bash
echo "Installing Playwright for PDF export..."
npm install -D playwright-chromium
npx playwright install chromium
```

### Invalid Content

**Code block too long:**
```
⚠️ Warning: Code block on slide [N] is [X] lines (recommended max: 20)

Suggestions:
1. Show only key parts
2. Split across multiple slides
3. Use ellipsis (...) for omitted code
```

**Diagram too complex:**
```
⚠️ Warning: Mermaid diagram has [X] nodes (recommended max: 15)

Suggestions:
1. Simplify the diagram
2. Split into multiple diagrams
3. Use a higher-level abstraction
```

**Slide overload:**
```
⚠️ Warning: Section "[Name]" has [X] slides (recommended: 3-5 per section)

Suggestion: Consider breaking into subsections
```

### Installation Failures

**Network issues:**
```bash
if npm install fails; then
  echo "Installation failed. Trying with --legacy-peer-deps..."
  npm install --legacy-peer-deps
fi
```

**Permission issues:**
```bash
if permission denied; then
  echo "Permission denied. Try:"
  echo "  sudo npm install -g @slidev/cli"
  echo "Or use npx: npx slidev"
fi
```

## Best Practices

### Content Creation

1. **One Idea Per Slide**: Each slide should convey a single concept
2. **Visual > Text**: Use diagrams, code, and visuals over long text
3. **Progressive Disclosure**: Use animations to reveal information gradually
4. **Consistency**: Maintain consistent layout and style throughout
5. **White Space**: Don't overcrowd slides with content

### Code Examples

1. **Keep It Short**: Max 20 lines per slide
2. **Highlight Key Lines**: Use `{1|2-4|5}` for emphasis
3. **Add Context**: Use two-column layout for explanation
4. **Syntax Highlighting**: Always specify language
5. **Readable Fonts**: Ensure code is large enough to read

### Diagrams

1. **Simplicity**: Keep diagrams focused and uncluttered
2. **Labels**: Use clear, descriptive labels
3. **Colors**: Use colors sparingly for emphasis
4. **Flow**: Ensure diagrams have clear flow (left-to-right, top-to-bottom)
5. **Legends**: Add legends if needed for clarity

### Presenter Notes

1. **Every Slide**: Add notes to every slide
2. **Timing**: Include estimated time per slide
3. **Key Points**: Highlight critical information
4. **Interactions**: Note when to engage audience
5. **Transitions**: Add notes for moving between sections

## Advanced Features

### Custom Components

If user needs custom Vue components:

```bash
# Create components directory
mkdir -p components

# Create component file
Write: components/CustomComponent.vue
```

```vue
<template>
  <div class="custom-component">
    <slot />
  </div>
</template>

<script setup>
// Component logic
</script>

<style scoped>
.custom-component {
  /* Styles */
}
</style>
```

Use in slides:
```markdown
<CustomComponent>
  Content here
</CustomComponent>
```

### Custom Styling

Add to frontmatter:
```yaml
---
theme: apple-basic
css: unocss
---

<style>
.slidev-layout {
  @apply text-xl;
}

/* Custom classes */
.highlight {
  @apply bg-yellow-200 px-2 py-1 rounded;
}
</style>
```

### Interactive Elements

**Embedded iframes:**
```markdown
---
layout: iframe
url: https://example.com
---
```

**Live code editor** (requires addon):
```markdown
\`\`\`js {monaco}
console.log('Editable code')
\`\`\`
```

## Troubleshooting

### Common Issues

**1. Slides not rendering**
- Check for unclosed code blocks
- Verify `---` separators have blank lines before/after
- Validate Mermaid syntax

**2. Theme not loading**
- Ensure theme package is installed: `npm install -D @slidev/theme-[name]`
- Check theme name in frontmatter

**3. Export fails**
- Install Playwright: `npm install -D playwright-chromium`
- Run: `npx playwright install chromium`

**4. Hot reload not working**
- Restart dev server
- Clear `.slidev` cache: `rm -rf .slidev`

## Quick Reference

### Slidev Layouts

- `cover` - Title slide
- `center` - Centered content
- `default` - Standard content
- `section` - Section divider
- `two-cols` - Two columns
- `quote` - Quotation
- `fact` - Emphasized data
- `image-left` / `image-right` - Image with content
- `end` - Final slide

### Mermaid Diagram Types

- `graph TD` / `graph LR` - Flowchart
- `sequenceDiagram` - Sequence diagram
- `gantt` - Gantt chart
- `pie` - Pie chart
- `classDiagram` - Class diagram

### Animation Directives

- `<v-clicks>` - Progressive list reveal
- `<v-click>` - Single element reveal
- `{all|1|2-4|5}` - Code line highlighting

## Checklist

Before finalizing the presentation:

- [ ] Title slide is compelling and clear
- [ ] Agenda matches actual content
- [ ] Each slide has one focused message
- [ ] Text is concise (no walls of text)
- [ ] Code blocks have language specified
- [ ] Code is under 20 lines per slide
- [ ] Diagrams are simple and clear
- [ ] Animations enhance (don't distract)
- [ ] Presenter notes on every slide
- [ ] Timing estimates included
- [ ] Theme is appropriate for topic
- [ ] Navigation flows logically
- [ ] Summary slide recaps key points
- [ ] Contact info on final slide
- [ ] All assets exist in assets/ directory
- [ ] No broken links or references
- [ ] Presentation builds without errors
- [ ] Export to PDF works

## Example Invocations

### Example 1: Scrum Training
```
/build-slides

Create a comprehensive Scrum Master training presentation covering:
- Sprint Planning (goals, process, outcomes)
- Daily Standup (three questions, common pitfalls, time management)
- Sprint Review (demo guidelines, stakeholder engagement)
- Sprint Retrospective (formats, action items, continuous improvement)

Include flowcharts for each ceremony and add presenter notes with timing.
Target audience: New Scrum Masters
Length: 20-25 slides
```

### Example 2: Technical Talk
```
/build-slides

I need slides for a tech talk about "Building REST APIs with FastAPI"
Cover:
- Introduction to FastAPI
- Setting up a project
- Creating endpoints (with Python code examples)
- Request/response models
- Async operations
- Testing strategies

Include code examples with syntax highlighting and diagrams showing request flow.
```

### Example 3: Quick Update
```
/build-slides --update

Add a new section after slide 10 about "Handling Distributed Teams in Scrum"
Include tips for remote standups and async communication patterns.
```

## Success Criteria

The skill is successful when:

1. ✅ Generates syntactically valid slides.md
2. ✅ Slides render correctly in Slidev
3. ✅ Code blocks have proper syntax highlighting
4. ✅ Mermaid diagrams display correctly
5. ✅ Animations work as intended
6. ✅ Presenter notes are helpful and detailed
7. ✅ Theme and styling are appropriate
8. ✅ Project structure is correct
9. ✅ Export to PDF/PPTX works
10. ✅ User can preview and iterate easily

## Notes

- **Always** read template files before generating content
- **Always** add presenter notes to every slide
- **Always** validate slides.md syntax before finishing
- **Always** provide clear next steps to the user
- Keep slides simple and focused
- Use visuals over text where possible
- Test export functionality if user requests it

---

**Created with ❤️ by Claude Code**

For issues or improvements, please provide feedback!
