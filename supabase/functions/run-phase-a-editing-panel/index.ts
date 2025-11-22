import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 [PHASE A] Starting Client Cards Editing Panel Analysis...');

    const systemEvidence = {
      component: "EditCaseDialog.tsx",
      mobile_issues: [
        "Dialog content scrolling issues on mobile viewport",
        "Input fields have fixed height (h-12) causing touch target problems",
        "Select dropdowns (z-[100], z-50) have z-index conflicts",
        "Form grid layout (md:grid-cols-2) not optimized for mobile single-column",
        "DialogContent max-h-[90vh] causes content cutoff on smaller screens",
        "No mobile-specific input sizing or spacing",
        "Photo upload controls not touch-optimized",
        "Notes textarea scrolling issues within scrollable dialog"
      ],
      screenshots_evidence: {
        IMG_3753: "Shows dropdown menu properly rendered but overall dialog scroll issues",
        IMG_3752: "Form fields visible but cramped, date input placeholder visible",
        IMG_8179: "Notes section with large textarea but Save/Cancel buttons potentially obscured"
      },
      current_implementation: {
        dialog_wrapper: "DialogContent with max-w-5xl max-h-[90vh] overflow-y-auto",
        input_styling: "Fixed h-12 height for all inputs",
        select_styling: "z-[100] for some selects, z-50 for others - INCONSISTENT",
        grid_layout: "grid-cols-1 md:grid-cols-2 - breakpoint at md",
        photo_controls: "Avatar with Upload/Camera buttons - not touch optimized",
        notes_area: "Textarea with potential scroll-in-scroll issue"
      }
    };

    const criticalIssues = [
      "MOBILE VIEWPORT: DialogContent max-h-[90vh] causes bottom content (Save/Cancel) to be cut off or hard to reach on mobile",
      "Z-INDEX CONFLICT: Inconsistent z-index values (z-[100] vs z-50) cause dropdown overlay issues",
      "TOUCH TARGETS: Input height h-12 (48px) is BELOW the recommended 44px minimum for comfortable mobile touch",
      "SCROLL NESTING: Textarea inside scrollable DialogContent creates nested scroll zones - poor UX",
      "MOBILE GRID: Grid layout breaks to single column only at 'md' breakpoint (768px) - should break earlier for better mobile experience",
      "DATE INPUT: DD.MM.YYYY format requires manual typing - no mobile-friendly date picker fallback",
      "PHOTO UPLOAD: Small upload buttons (icons) are hard to tap on mobile devices",
      "DROPDOWN POSITIONING: position='popper' with sideOffset may cause dropdowns to render off-screen on narrow viewports"
    ];

    const proposedSolution = `
## 🎯 PHASE A SOLUTION: Mobile-First Client Cards Editing Panel

### ROOT CAUSE ANALYSIS
The EditCaseDialog was designed for desktop with insufficient mobile considerations:
1. Fixed viewport heights cause content clipping
2. Inconsistent z-index layering creates dropdown bugs  
3. Touch targets don't meet accessibility standards
4. Nested scrolling creates UX confusion
5. No responsive breakpoint optimization for mobile-first

### PROPOSED CHANGES (5-Phase Implementation)

#### PHASE 1: Mobile-First Dialog Architecture
- Remove max-h-[90vh], use min-h-[100vh] sm:min-h-auto for mobile full-screen
- Add fixed bottom action bar for Save/Cancel on mobile (sticky positioning)
- Implement smooth scroll-to-top on dialog open
- Add mobile-specific padding adjustments (p-4 on mobile vs p-6 on desktop)

#### PHASE 2: Touch-Optimized Input Controls  
- Increase all input heights: h-12 → h-14 sm:h-12 (56px mobile, 48px desktop)
- Add larger tap targets for photo upload (min-h-[88px] touch area)
- Implement native date picker fallback for mobile (type="date" with format conversion)
- Add touch-friendly Select trigger sizing (min-h-[56px] on mobile)

#### PHASE 3: Fix Z-Index & Dropdown Layering
- Standardize ALL Select components to z-[200] (above dialog overlay z-50)
- Change position="popper" → position="item" for mobile viewports
- Add viewport detection for dropdown positioning strategy
- Remove sideOffset on mobile to prevent off-screen rendering

#### PHASE 4: Eliminate Scroll Nesting
- Move Notes textarea to separate collapsible section or dedicated view
- Implement auto-expanding textarea (no internal scrolling)
- Add clear visual separation between scrollable sections
- Consider tabbed interface for mobile (Basic Info / Notes / Photo tabs)

#### PHASE 5: Enhanced Mobile Responsiveness
- Change grid breakpoint: md:grid-cols-2 → lg:grid-cols-2 (earlier single-column switch)
- Add mobile-specific field ordering (most important fields first)
- Implement field grouping with collapsible sections on mobile
- Add progress indicator for multi-section forms on mobile

### CRITICAL FIXES (Immediate Priority)
1. **Save/Cancel Visibility**: Make action buttons sticky/fixed on mobile
2. **Z-Index**: Unify to z-[200] for all dropdowns
3. **Touch Targets**: Minimum 56px height on mobile
4. **Date Input**: Add native picker for mobile devices
`;

    // Store analysis in database
    const { data: analysisRecord, error: insertError } = await supabaseClient
      .from('phase_a_analyses')
      .insert({
        agent_name: 'phase_a_editing_panel_analyzer',
        domain: 'client_cards_editing_panel',
        analysis_result: {
          system_evidence: systemEvidence,
          critical_issues: criticalIssues,
          proposed_solution: proposedSolution,
          timestamp: new Date().toISOString(),
          analyzed_component: 'EditCaseDialog.tsx',
          mobile_viewport_issues: true,
          priority: 'CRITICAL',
        },
        total_issues: criticalIssues.length,
        critical_issues: criticalIssues,
        proposed_changes: proposedSolution,
        root_cause: "EditCaseDialog designed for desktop without mobile-first considerations",
        proposed_solution: proposedSolution,
        context: {
          screenshots_provided: ['IMG_3753.png', 'IMG_3752.png', 'IMG_8179-2.jpeg'],
          focus_area: 'mobile_editing_ux',
          component: 'EditCaseDialog.tsx',
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to store Phase A analysis:', insertError);
      throw insertError;
    }

    console.log('✅ [PHASE A] Analysis completed and stored');

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id: analysisRecord.id,
        domain: 'client_cards_editing_panel',
        total_issues: criticalIssues.length,
        critical_issues: criticalIssues,
        summary: {
          component: 'EditCaseDialog.tsx',
          focus: 'Mobile Editing Panel UX',
          priority: 'CRITICAL',
          issues_found: criticalIssues.length,
          evidence_sources: 3, // 3 screenshots
        },
        next_step: 'Review findings and proceed to Phase B verification',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ [PHASE A] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        analysis_failed: true,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
