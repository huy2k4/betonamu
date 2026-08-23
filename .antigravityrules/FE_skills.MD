# Frontend Development Skills and Best Practices

This document outlines frontend (FE) guidelines and development patterns for the Antigravity agent.

## Core Best Practices

### 1. No Hardcoded Styling, Colors, or Layouts
- **Semantic CSS Variables**: Define theme colors, margins, font sizes, transitions, and shadows as CSS variables (custom properties) in `index.css` (e.g. `--color-primary`, `--color-background`, `--border-radius-lg`).
- **Responsive Layouts**: Use modern CSS layouts (Flexbox, Grid) with percentage/rem sizing to ensure screens adapt beautifully across mobile, tablet, and desktop views. Avoid hardcoded pixel widths and heights.

### 2. No Hardcoded Strings
- **Localization and Content Modules**: Define user-facing labels, page titles, text content, validation messages, and dropdown options in localized files, constants, or layout configuration maps.
- **Dynamic Content Injection**: Ensure data models supply page text dynamically where possible rather than hardcoding headings and paragraphs in HTML/JS components.

### 3. Graceful UI Failure & State Management
- **Error Boundaries & Recovery**: Wrap key client-side flows with error boundary controls. If a component fails or an API call errors, display an intuitive fallback interface instead of letting the application crash.
- **Loading & Empty States**: Always provide visual cues (skeletons, spinners, progress bars) during asynchronous loading phases, and clear empty-state illustrations when no data is returned.

### 4. Rich Aesthetics & Interactions
- **Premium Styling**: Leverage modern aesthetics like glassmorphism, depth-aware shadows, curated color harmonies, and modern Google Fonts (Inter, Roboto, Outfit).
- **Subtle Micro-Animations**: Implement smooth hover states, page transition cues, and spring-like button interactions to make the app feel responsive and premium.
