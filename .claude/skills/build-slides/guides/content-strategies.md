# Content Parsing and Generation Strategies

This guide contains algorithms and strategies for parsing conversational input and generating structured slide content.

## Input Parsing Algorithm

### Step 1: Extract Main Topic

```
Algorithm: extract_main_topic(user_input)
1. Identify key nouns and noun phrases
2. Look for topic indicators:
   - "about [topic]"
   - "on [topic]"
   - "[topic] presentation"
   - "covering [topic]"
3. First major concept mentioned is usually the main topic
4. Extract subtitle if present (secondary descriptor)

Return: {main_title, subtitle}
```

**Examples**:
- Input: "Create slides about Scrum daily standups"
  - main_title: "Scrum Daily Standups" | "Daily Standup"
  - subtitle: null

- Input: "Presentation on Building REST APIs with FastAPI"
  - main_title: "Building REST APIs with FastAPI"
  - subtitle: "A Modern Python Framework"

### Step 2: Identify Subtopics and Sections

```
Algorithm: extract_sections(user_input)
1. Look for section indicators:
   - Lists: "covering X, Y, and Z"
   - Keywords: "include", "cover", "discuss", "explain"
   - Numbered lists: "1. X 2. Y 3. Z"
2. Split on commas, conjunctions (and, or), semicolons
3. Each item becomes a section
4. Hierarchical indicators: "first", "next", "then", "finally"

Return: [{name, order}]
```

**Examples**:
- Input: "Cover sprint planning, daily standups, sprint review, and retrospectives"
  - sections: ["Sprint Planning", "Daily Standups", "Sprint Review", "Retrospectives"]

- Input: "First explain the concept, then show examples, and finally discuss best practices"
  - sections: ["Concept Explanation", "Examples", "Best Practices"]

### Step 3: Classify Content Type

```
Algorithm: classify_content(text)

For each section/subsection:
1. Check for keywords indicating content type
2. Apply classification rules (see table below)
3. Assign slide type and layout

Return: {type, layout, special_features}
```

## Content Classification Matrix

| Keywords/Indicators | Content Type | Slide Type | Layout | Special Elements |
|---------------------|--------------|------------|--------|------------------|
| list, points, items, aspects | Bulleted list | bullets | default/center | v-clicks animation |
| process, flow, steps, cycle, workflow | Process diagram | diagram | center | Mermaid flowchart |
| code, function, script, program, implementation | Code example | code | two-cols | Syntax highlighting |
| compare, versus, vs, difference, contrast | Comparison | comparison | two-cols | Side-by-side layout |
| definition, meaning, what is, concept | Definition | definition | quote/center | Emphasis |
| statistics, numbers, metrics, data, percentage | Stat emphasis | fact | fact/center | Large numbers |
| example, instance, case, scenario | Example | example | default | Real-world context |
| diagram, chart, graph, visual, illustration | Visual | diagram | center | Mermaid/image |
| image, photo, screenshot, picture | Image | image | image-left/right | Asset required |
| quote, said, according to | Quote | quote | quote | Attribution |
| best practices, tips, guidelines, recommendations | Best practices | bullets | default | Checkmarks/icons |
| common mistakes, pitfalls, anti-patterns, avoid | Anti-patterns | bullets | default | Warning icons |
| do, should, must | Do's | bullets | two-cols (left) | Check icons |
| don't, avoid, never, shouldn't | Don'ts | bullets | two-cols (right) | X icons |
| how to, tutorial, guide, walkthrough | Tutorial | code/bullets | two-cols | Step-by-step |
| why, reason, because, purpose | Explanation | bullets | default | Logical flow |
| summary, recap, review, takeaways | Summary | summary | center | v-clicks |
| introduction, overview, about | Intro | bullets | default/center | High-level |
| conclusion, final thoughts, wrap up | Conclusion | summary | center | Key points |

## Slide Count Estimation

### Algorithm

```
Function: estimate_slide_count(sections, depth, features)

base_slides = 2  # Cover + Agenda

For each section:
    section_intro = 1  # Section divider slide

    If depth == "high":
        content_slides = 5-7
    Else if depth == "medium":
        content_slides = 3-5
    Else:  # depth == "low"
        content_slides = 2-3

    If section has diagrams:
        content_slides += 1 per diagram

    If section has code examples:
        content_slides += 1 per code example

    section_total = section_intro + content_slides

conclusion_slides = 2  # Summary + Q&A

total = base_slides + sum(section_totals) + conclusion_slides
total_with_buffer = total * 1.2  # 20% buffer

Return: round(total_with_buffer)
```

### Depth Indicators

**High Depth** (detailed, comprehensive, in-depth):
- Keywords: "comprehensive", "detailed", "in-depth", "thorough"
- Audience: Beginners, training materials
- Slides per topic: 5-7

**Medium Depth** (standard, balanced):
- Default if not specified
- Audience: General, mixed experience
- Slides per topic: 3-5

**Low Depth** (overview, high-level, brief):
- Keywords: "overview", "brief", "quick", "summary"
- Audience: Experts, conference talks
- Slides per topic: 2-3

## Special Element Detection

### Code Detection

```
Algorithm: detect_code_requirements(text)

Indicators:
- Direct mentions: "code", "function", "script", "implementation"
- Language names: "python", "javascript", "java", etc.
- Action verbs: "implement", "write", "create", "build"
- Technical terms: "API", "algorithm", "class", "method"

If detected:
1. Extract mentioned language (default to Python if not specified)
2. Determine code length (snippet vs full example)
3. Check if explanation needed (two-cols vs single)
4. Add line highlighting if "step-by-step" mentioned

Return: {has_code, language, needs_explanation, line_highlighting}
```

### Diagram Detection

```
Algorithm: detect_diagram_requirements(text)

Type Detection:
- Flowchart: "flow", "process", "steps", "cycle", "workflow"
- Sequence: "interaction", "communication", "sequence", "exchange"
- Gantt: "timeline", "schedule", "plan", "roadmap"
- Pie/Bar: "distribution", "breakdown", "proportion", "percentage"
- Class: "structure", "architecture", "hierarchy", "relationships"

If detected:
1. Determine diagram type
2. Extract components/nodes from text
3. Identify relationships/flow
4. Set complexity (simple/moderate/complex)

Return: {has_diagram, type, components, complexity}
```

### Animation Requirements

```
Algorithm: detect_animation_needs(text)

Indicators:
- "step-by-step", "one by one", "progressive", "gradually"
- "reveal", "show", "appear", "display"
- "interactive", "click", "engage"

If detected:
1. Apply v-clicks to lists
2. Use code line highlighting
3. Add v-click for emphasis elements

Return: {use_animations, animation_type}
```

### Presenter Notes Requirements

```
Algorithm: generate_presenter_notes(slide_content, context)

Always include:
1. Main talking points (what to say)
2. Timing estimate (how long)
3. Key points (what to emphasize)

Conditionally add:
- Interactions (questions, polls, activities)
- Transitions (link to next slide)
- Troubleshooting (common questions, clarifications)
- Sources (references, citations)

Return: formatted presenter notes
```

## Content Generation Patterns

### Pattern 1: Concept Introduction

```
Structure:
1. Section divider: "[Concept Name]"
2. Definition slide: "What is [Concept]?"
3. Purpose slide: "Why [Concept] matters"
4. Components slide: "Key elements of [Concept]"
5. Example slide: "[Concept] in practice"

Slides: 5
Layouts: section, center, default, default, two-cols
```

### Pattern 2: Process Explanation

```
Structure:
1. Section divider: "[Process Name]"
2. Overview: "What is [Process]?"
3. Diagram: "[Process] flow"
4. Step details: One slide per major step
5. Pitfalls: "Common mistakes"
6. Best practices: "Tips for success"

Slides: 6+
Layouts: section, default, center (diagram), default (repeated), two-cols, default
```

### Pattern 3: Code Tutorial

```
Structure:
1. Section divider: "[Topic]"
2. Concept: "Understanding [Concept]"
3. Code example 1: Simple case (two-cols)
4. Code example 2: Advanced case (two-cols)
5. Best practices: "Code guidelines"
6. Common errors: "What to avoid"

Slides: 6
Layouts: section, default, two-cols, two-cols, default, default
```

### Pattern 4: Comparison

```
Structure:
1. Section divider: "[Topic]"
2. Overview: "Comparing [A] and [B]"
3. Features: Side-by-side (two-cols)
4. Use cases: When to use each
5. Recommendation: "Which to choose?"

Slides: 5
Layouts: section, default, two-cols, default, center
```

## Layout Selection Logic

### Decision Tree

```
Function: select_layout(slide_content, slide_type)

If slide_type == "cover":
    return "cover"

If slide_type == "section":
    return "section"

If slide_type == "bullets":
    If item_count > 6:
        return "default"  # More space
    Else:
        return "center"  # Emphasis

If slide_type == "code":
    If has_explanation:
        return "two-cols"  # Code + explanation
    Else:
        return "default"  # Code only

If slide_type == "diagram":
    return "center"  # Focus on visual

If slide_type == "comparison":
    return "two-cols"  # Side-by-side

If slide_type == "image":
    If image_is_primary:
        return "image"  # Full-screen
    Else if emphasis_on_left:
        return "image-right"  # Content left, image right
    Else:
        return "image-left"  # Image left, content right

If slide_type == "quote":
    return "quote"

If slide_type == "fact":
    return "fact"

If slide_type == "end":
    return "end"

Default:
    return "default"
```

## Scrum-Specific Parsing

### Ceremony Detection

```
If text contains ceremony keywords:

Sprint Planning:
- Keywords: "sprint planning", "planning meeting", "sprint commitment"
- Structure: Purpose → Process → Participants → Duration → Output
- Slides: 5-6
- Include: Planning flow diagram

Daily Standup:
- Keywords: "daily standup", "daily scrum", "standup meeting"
- Structure: Purpose → Three Questions → Time-boxing → Tips → Pitfalls
- Slides: 4-5
- Include: Standup flow diagram

Sprint Review:
- Keywords: "sprint review", "demo", "review meeting"
- Structure: Purpose → Demo guidelines → Stakeholder engagement → Feedback
- Slides: 4-5
- Include: Review process diagram

Sprint Retrospective:
- Keywords: "retrospective", "retro", "sprint retrospective"
- Structure: Purpose → Formats → Action items → Continuous improvement
- Slides: 5-6
- Include: Retrospective techniques diagram
```

### Artifact Detection

```
If text contains artifact keywords:

Product Backlog:
- Keywords: "product backlog", "backlog items"
- Structure: Definition → Purpose → Prioritization → Refinement
- Slides: 4

Sprint Backlog:
- Keywords: "sprint backlog", "sprint items"
- Structure: Definition → Creation → Tracking → Updates
- Slides: 4

Increment:
- Keywords: "increment", "potentially shippable", "done increment"
- Structure: Definition → Definition of Done → Value delivery
- Slides: 3
```

## Quality Checks

### Pre-Generation Validation

```
Function: validate_structure(parsed_structure)

Checks:
1. Total slides < 50 (too many = information overload)
2. Total slides > 5 (too few = not enough content)
3. Each section has 2-7 slides (balanced)
4. Code blocks < 20 lines (readable)
5. Diagrams have < 15 nodes (not too complex)
6. Presenter notes on all slides (required)

If validation fails:
- Issue warning
- Suggest adjustments
- Ask user for confirmation
```

### Post-Generation Validation

```
Function: validate_output(slides_md_content)

Checks:
1. Frontmatter is valid YAML
2. All code blocks are closed (```)
3. All slide separators have blank lines (--- with blank before/after)
4. All Mermaid diagrams have valid syntax
5. No broken internal links
6. All referenced assets exist

If validation fails:
- Fix automatically if possible
- Report issues to user
- Suggest corrections
```

## Edge Cases

### Vague Input

```
If input is too vague (< 10 words, no specifics):
1. Ask clarifying questions:
   - "What specific topics should be covered?"
   - "Who is the target audience?"
   - "What's the goal of this presentation?"
2. Provide examples of good input
3. Wait for detailed response
```

### Conflicting Requirements

```
If requirements conflict:
- "Short presentation with comprehensive coverage"
- "Quick overview with detailed examples"

Action:
1. Detect contradiction
2. Present options to user:
   Option A: Short (15 slides, high-level)
   Option B: Comprehensive (30 slides, detailed)
   Option C: Balanced (22 slides, moderate depth)
3. Let user decide
```

### Too Much Content

```
If estimated slides > 50:
1. Warn user about length
2. Suggest breaking into multiple presentations
3. Offer to prioritize topics
4. Ask which sections to focus on
```

### Missing Information

```
If critical information missing:
1. Make reasonable assumptions
2. Document assumptions in comments
3. Inform user of assumptions made
4. Offer to revise if assumptions incorrect
```

## Tips for Better Parsing

1. **Look for Structure**: Lists, numbered items, hierarchies
2. **Identify Patterns**: Repeated words, parallel constructions
3. **Extract Relationships**: "before/after", "compare", "leads to"
4. **Detect Emphasis**: Words in quotes, ALL CAPS, "important"
5. **Consider Context**: Domain-specific terms, jargon
6. **Ask When Uncertain**: Better to clarify than assume
7. **Default to Simplicity**: Start simple, can always add complexity
8. **Balance Content**: Not too much text, not too sparse
9. **Think Visual**: Convert text to diagrams where possible
10. **Always Add Notes**: Presenter notes make slides useful

---

Use these strategies when parsing user input and generating slide content to ensure high-quality, well-structured presentations.
