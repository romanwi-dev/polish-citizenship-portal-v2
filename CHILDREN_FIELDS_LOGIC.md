# Children Fields Logic - Clarification

## Database Fields (both exist in master_table)
1. **`children_count`** - Total number of children (including adults)
2. **`minor_children_count`** - Number of minor children under 18

## UI Flow (Correct Logic)

### Step 1: Total Children Selection
- User selects total children count (0-10)
- Label: "Total children"
- This appears by default in Select section

### Step 2: Minor Children Selection (conditional)
- Only shows if `children_count > 0`
- User selects how many are minors (0 to total children count)
- Label: "Minor children (under 18)"
- Dropdown options: 0 to `children_count`

### Step 3: Children Tab/Section Visibility
- Children tab appears ONLY if `minor_children_count > 0`
- This is correct because we only collect POA details for MINOR children
- Adult children should be processed as separate applicants

## Why This Makes Sense
- If someone has 3 total children but all are adults (minor_children_count = 0), no Children tab appears ✅
- If someone has 3 total children and 2 are minors, Children tab appears and shows 2 child forms ✅
- If someone has NO children, no minor field appears and no Children tab ✅

## Updated Labels for Clarity
- OLD: "Children" → NEW: "Total children"
- OLD: "Minor children" → NEW: "Minor children (under 18)"

This makes it crystal clear what each field means.
