# COMPREHENSIVE CODEX VERIFICATION PLAN

## STEP 1: IDENTIFY THE CRASH SOURCE
- Check if crash happens when clicking "Legendary" filter
- Check browser console for specific error messages
- Identify if it's a sprite loading issue or data issue

## STEP 2: SYSTEMATIC SPRITE VERIFICATION
- Verify all 68 slimes have corresponding sprite files
- Create a list of missing sprites
- Fix or remove slimes with missing sprites

## STEP 3: FILTER LOGIC VERIFICATION  
- Test each rarity filter (Common, Uncommon, Rare, Legendary)
- Test each element filter
- Test each family filter
- Verify filter combinations work

## STEP 4: DATA STRUCTURE VERIFICATION
- Verify all slimes have required properties
- Check for data inconsistencies
- Ensure proper type matching

## STEP 5: RENDERING VERIFICATION
- Test slime rendering in codex
- Verify silhouette rendering works
- Check for React hooks issues

## CURRENT STATUS:
- Ancient Mysteries: Fixed (removed Harmony Slime)
- Cosmic Elements: Fixed (removed Harmony Slime)  
- Legendary Filter: CRASHING - NEED INVESTIGATION

## IMMEDIATE ACTION:
1. Check browser console for Legendary filter crash details
2. Identify the specific slime causing the crash
3. Fix the root cause systematically
