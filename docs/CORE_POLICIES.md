# CORE POLICIES

## Project Philosophy

This Polish Citizenship Portal is a **professional legacy project** — not just another website. It represents the culmination of professional expertise and must be treated with the highest standards of quality, flexibility, and maintainability.

---

## POLICY 1: Multiple Implementation Approaches

**RULE:** For each and every task, always consider and evaluate multiple implementation approaches.

**WHY:** Rushing to a single solution without exploring alternatives leads to technical debt, failed implementations, and wasted time (as demonstrated by the 14-hour, 28-attempt translation splitting incident).

**HOW:**
- Before implementing, identify at least 2-3 viable approaches
- Evaluate trade-offs: complexity, maintainability, performance, flexibility
- Document why the chosen approach was selected
- When stuck, pivot to alternative approach immediately

---

## POLICY 2: Elasticity & Adaptability First

**RULE:** The entire portal must be elastic, editable, and ready for changes, adjustments, and enhancements — easily, whenever needed, and fast to implement.

**WHY:** Requirements evolve. Business needs change. The architecture must support rapid iteration without breaking existing functionality.

**HOW:**
- Design for change: loose coupling, clear boundaries, modular components
- Avoid hardcoded values; use configuration files and constants
- Keep components small, focused, and reusable
- Use composition over inheritance
- Document extension points clearly

---

## POLICY 3: Multi-Domain & Multi-Landing Page Architecture

**RULE:** The system must support different versions on different domains and multiple landing pages tailored for different regions where people of Polish descent live.

**WHY:** Different markets (USA, UK, Australia, Israel, etc.) require localized content, messaging, and possibly different workflows.

**HOW:**
- Design for multi-tenancy from the start
- Separate content from code
- Use feature flags and environment-based configuration
- Support region-specific routing and content delivery
- Design database schema to handle multiple domains/regions
- Plan for CDN and geo-distributed deployment

---

## POLICY 4: Professional Legacy Standards

**RULE:** This is a legacy project representing professional expertise. Every decision must meet the highest standards of quality.

**WHY:** This project will serve clients for years and represents professional reputation.

**HOW:**
- Zero-tolerance for quick hacks or "temporary" solutions
- Comprehensive error handling and logging
- Security-first approach (especially for PII/sensitive data)
- Performance optimization from day one
- Accessibility compliance (WCAG standards)
- Comprehensive documentation for all complex logic
- Follow ZERO-FAIL, TRUE-FIX, and NO-RUSH protocols religiously

---

## POLICY 5: Fast & Efficient Implementation

**RULE:** Despite high quality standards, implementation must be fast and efficient. No 14-hour marathons for simple tasks.

**WHY:** Time is valuable. Getting stuck indicates wrong approach, not insufficient effort.

**HOW:**
- If stuck for >30 minutes, step back and reassess approach
- Use proven patterns and existing solutions
- Don't reinvent the wheel
- Leverage AI agents and automation where appropriate
- Break large tasks into small, verifiable increments
- Timebox exploration and experimentation

---

## Adding New Policies

New policies will be added to this document as the project evolves. Each policy must include:
- **RULE:** What is the policy
- **WHY:** Rationale and context
- **HOW:** Practical implementation guidelines

---

## Related Documentation

- [ZERO-FAIL Protocol](./ZERO_FAIL_PROTOCOL.md)
- [TRUE-FIX Protocol](./TRUE_FIX_PROTOCOL.md)
- [NO-RUSH Protocol](./NO_RUSH_PROTOCOL.md)
- [Security Policy](../SECURITY_POLICY.md)
- [Architecture Documentation](./ARCHITECTURE.md)
