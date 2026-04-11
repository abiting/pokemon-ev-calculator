# Project Tasks

## MovesEn Page Adjustments (Part 3)
- [ ] Replace "Sword & Shield" tab with an empty "Champions" tab
- [ ] Keep "Scarlet & Violet" tab and ensure Egg moves are included
- [ ] Inherit moves for Mega/Gmax forms from their base forms
- [ ] Rename "TM/TR" to "TM", "Level up" to "Level", "Egg" to "Egg"
- [ ] Group moves by learn method
- [ ] Fix variety naming (e.g., Venusaur Mega -> Mega Venusaur)
- [ ] Add a custom Held Item selector (searchable list of items)

## Team Builder Page
- [ ] Create a new Team Builder page with 6 Pokémon slots
- [ ] Allow users to search and select Pokémon for each slot
- [ ] Allow users to select Ability, Item, up to 4 Moves (sorted alphabetically), and EVs for each Pokémon
- [ ] Display the team in a grid of cards similar to the provided screenshot
- [ ] Add routing and navigation for the new Team Builder page

## Team Builder Enhancements
- [ ] Fix form selection update issue in TeamSlot component
- [ ] Optimize TeamSlot UI (larger image, smaller ability, gradient background, wider item dropdown)
- [ ] Add download team image feature in TeamBuilder
- [ ] Widen item dropdown in TeamSlot component to show full names
- [ ] Improve background color scheme for TeamBuilder and TeamSlot components
- [ ] Fix item dropdown icon overlapping with text and going out of bounds
- [ ] Change move list to show all existing moves instead of just the ones the Pokemon can learn
- [ ] Remove Team Builder button from Home page
- [ ] Sort moves alphabetically in TeamSlot
- [ ] Fix item icon overlapping in TeamSlot (ensure it doesn't overlap text or go out of bounds)
- [ ] Filter out special moves (Z-moves, Max moves, etc.) from the moves list
- [ ] Fix item icon overlapping in TeamSlot (ensure it doesn't overlap text or go out of bounds)
- [x] Fix the download team functionality
- [ ] Save a checkpoint for the project
- [x] Fix mobile download layout to use desktop grid ratio
- [x] Remove /moves-en route and related files
- [ ] Save a checkpoint for the project
- [ ] Fix Pokemon form selector not updating correctly and preventing switching back
- [ ] Fix form selector English names and empty parentheses issue
- [ ] Fix screenshot not capturing Pokemon images
- [ ] Fix form selector switching and display issues
- [ ] Fix screenshot not capturing Pokemon images
- [ ] Remove '(Hidden)' from abilities
- [ ] Save project checkpoint
- [ ] Remove Download Team feature
- [ ] Add SP Calculator link to navigation
- [ ] Update grid layout in TeamBuilder.tsx to make slots wider
- [ ] Change TeamBuilder layout to 2 columns
- [ ] Make moves 2x2 grid in TeamSlot
- [ ] Enlarge Pokemon image in TeamSlot
- [ ] Implement team download feature using modern-screenshot and image preloading
- [ ] Redesign TeamSlot layout for better clarity and compactness
- [ ] Increase the size of the Pokemon image in TeamSlot
- [ ] Add spacing between the top section and bottom section in TeamSlot
- [ ] Remove text from the download button, leaving only the icon
- [ ] Fix the individual download button in TeamSlot
- [ ] Fix the individual download button in TeamSlot
- [ ] Remove Copyright © Scrabby from all pages (both English and Chinese)
- [ ] Fix name truncation in TeamSlot
- [ ] Hide download and clear buttons during screenshot in TeamSlot
- [ ] Fix text truncation in select fields (moves, items, abilities) in TeamSlot
- [ ] Fix ability select not displaying selected value in TeamSlot.tsx
- [ ] Fix item text truncation in TeamSlot.tsx
- [ ] Revert Combobox text wrapping and optimize spacing for single-line display
- [ ] Fix text truncation in Combobox by reducing font size and padding
- [ ] Fix overlapping Pokemon name and form selector in TeamSlot
- [ ] Fix individual TeamSlot screenshot by using modern-screenshot and applying fixed width
- [ ] Fix individual TeamSlot screenshot truncation by using correct width/scale logic
- [ ] Fix premature text truncation in screenshots caused by modern-screenshot miscalculating flex/truncate widths
- [ ] Fix Pokemon name wrapping issue in screenshots by applying whitespace-nowrap to the title
- [ ] Fix Pokemon name truncation issue in screenshots by allowing natural word wrapping without breaking words
- [ ] Remove the redundant nature effect text (e.g., "特攻 ×1.1，攻擊 ×0.9") below the nature selector in the EV Calculator tool
- [ ] Remove the redundant nature effect text (e.g., "特攻 ×1.1，攻擊 ×0.9") below the nature selector
- [ ] Add a simplified TeamSlot component (MiniTeamSlot) to the Champions page (PokemonDetail.tsx) to display and capture the current Pokemon's EV configuration
- [ ] Update MiniTeamSlot to enlarge image/name, shift them right, add URL, and remove external link icon
- [x] Keep mobile layout unchanged without QR code
- [ ] Fix translation errors in ChampionsEn.tsx
- [ ] Fix translation errors and syntax errors in the detail page of ChampionsEn.tsx
- [ ] Fix translation errors in PokemonCard.tsx and syntax errors in ChampionsEn.tsx
- [ ] Pass language="en" to PokemonCard in ChampionsEn.tsx
- [ ] Remove "DATA SOURCE" text from MiniTeamSlot
- [ ] Remove "Share Build" title from Champions and ChampionsEn pages
- [ ] Change MiniTeamSlot background to a dark gradient
- [ ] Remove desktop "Share Build" title from ChampionsEn.tsx
- [ ] Remove desktop "分享配置" title from Champions.tsx
- [ ] Add website URI "abitingpokedex.com" below the stats table in MiniTeamSlot
- [ ] Add website URI "abitingpokedex.com" in golden color below the stats table in MiniTeamSlot
- [ ] Fix text truncation for long Pokemon names on mobile in MiniTeamSlot
- [ ] Fix text truncation for long Pokemon names on mobile in MiniTeamSlot by adjusting font size instead of wrapping
- [ ] Add MiniTeamSlot component to the main Pokemon EV Calculator page
- [ ] Remove the hint text below MiniTeamSlot in Home.tsx
- [ ] Write a comprehensive README.md for the Pokemon EV Calculator project
- [ ] Expand README.md with detailed descriptions of the four main pages and project architecture
- [ ] Correct README.md to reflect EV system on Home page and 66 SP system on Champions pages
- [ ] Read App.tsx to confirm the four main pages
- [ ] Rewrite README.md with accurate page descriptions
- [ ] Rewrite README.md to correctly describe the four pages: Home (EV calculator), Champions (SP calculator, CN), Champions-en (SP calculator, EN), and Team Builder.
- [x] Update Mega Evolution abilities for specific Pokemon in both Chinese and English.
- [ ] Fix the missing Spicy Spray ability for Mega Scovillain.
- [ ] Fix the missing Spicy Spray ability for Mega Scovillain and update its translation to 辣椒噴發.
- [ ] Fix the missing Spicy Spray ability for Mega Scovillain, update its translation to 辣椒噴發, and update Dragonize translation to 龍皮膚.
- [x] Fix missing custom abilities for Mega Evolutions by bypassing API calls for them, and update translations for Spicy Spray and Dragonize.
- [ ] Fix language display in search results for English version.
- [ ] Fix language display in search results for Glimmora in English version.
- [x] Fix missing custom abilities for Mega Evolutions by bypassing API calls for them, and update translations for Spicy Spray and Dragonize.
- [ ] Fix language display in search results for English version so it always shows English names even when searching with Chinese.
- [x] Fix language display in search results for English version so it always shows English names even when searching with Chinese, by creating an English mapping.
- [x] Extract and compile a table of the newly added Mega Pokemon names and their abilities in both Chinese and English.
- [x] Update translation for Mega Meganium's ability from 超級日照 to 超級日光
- [x] Update translation for Mega Victreebel's ability from 飛出內臟 to 飛出的內在物
- [x] Verify translation updates for Mega Meganium and Mega Victreebel across the codebase
- [ ] Save a checkpoint for the project after translation updates
- [ ] Investigate if it's possible to fetch official battle data (usage rates for singles and doubles) for Pokemon Champions
- [ ] Create a new English page (DoublesTierList.tsx) to display the top 27 most used Pokemon in Double Battles
- [x] Extract the list of 27 Pokemon from the provided image (Corrected #2 to Sneasler, #5 to Poltchageist, #10 to Pelipper, #16 to Froslass, #20 to Floette, #24 to Kommo-o, #25 to Meganium, fixed Kommo-o image)
- [x] Display the Pokemon as a grid of thumbnails with rankings (1-27)
- [x] Do not display Pokemon names or usage percentages
- [x] Add routing and navigation for the new Doubles Tier List page
- [x] Remove the subtitle "Top 27 Most Used Pokémon in Double Battles" from the DoublesTierList page
- [ ] Remove the title "VGC Doubles Usage Ranking" from the DoublesTierList page
- [ ] Update Floette to Eternal Flower Floette in the DoublesTierList page
- [x] Add the Chinese and English translations for Floette (Eternal Flower) to the translation data
- [x] Investigate why the previous fix didn't work and correct the logic in pokeapi.ts or other relevant files to show Floette, Floette Eternal Flower, and Mega Floette
- [x] Investigate and fix the root cause of Floette (Eternal Flower) not appearing in any calculator page
- [x] Fix Floette forms not appearing in English calculator pages (HomeEn.tsx, ChampionsEn.tsx)
- [x] Add "Usage Rate" title to DoublesTierList.tsx
- [x] Fix the issue where the "Usage Rate" title is not displaying on the Doubles Tier List page
- [x] Add specific usage rate percentages to DoublesTierList.tsx based on the provided image
- [x] Fix Floette form IDs in pokeapi.ts to correctly map to Eternal Flower and Mega Floette, ensuring correct stats and images
- [x] Update cache key in pokeapi.ts to force refresh and verify Mega Floette ID
- [x] Fix Floette form IDs in pokeapi.ts (replace 10051 with 10061, add Mega Floette) and update cache key
- [ ] Fix the syntax error in pokeapi.ts, assign a unique virtual ID (e.g., 99999) to Mega Floette, and hardcode its stats, types, and image so it doesn't duplicate Eternal Flower
- [ ] Fix the layout of DoublesTierList.tsx to be responsive and iframe-friendly
- [ ] Fix the layout of the DoublesTierList page so it displays correctly when embedded in an iframe

- [ ] Update Mega Floette data with correct stats, ability, and image based on user's screenshots.

- [ ] Remove hardcoded Mega Floette data and fetch it directly from the API.

- [ ] Remove all hardcoded Mega Floette data and restore the original API fetching logic.

- [ ] Re-add Mega Floette data with correct stats, ability, and image.

- [ ] Fix the issue where Mega Floette is not appearing in the form selection dialog.

- [ ] Check if Mega Floette exists in the API and use it if available.

- [ ] Remove the duplicate hardcoded Mega Floette from the form selection dialog.

- [ ] Investigate and fix the duplicate Mega Floette issue and the 4 errors shown in the UI.

- [ ] Fix duplicate Mega Floette in varieties logic in pokeapi.ts
- [ ] Ensure 10296 maps correctly to Mega Floette

- [ ] Ensure searching for "花葉蒂" shows exactly three options: 花葉蒂, 花葉蒂（永恆之花）, and 超級花葉蒂

- [ ] Verify API data for 10296
- [ ] Remove hardcoded Mega Floette logic and correctly map 10296 to Mega Floette using the API

- [ ] Investigate why searching for "花葉蒂" doesn't show Mega Floette
- [ ] Investigate why searching for "10296" shows duplicate Mega Floette
- [ ] Fix the varieties logic in pokeapi.ts to ensure exactly three options for Floette

- [ ] Remove hardcoded Floette logic in fetchPokemonVarieties in pokeapi.ts

- [ ] Investigate why searching for "10296" shows duplicate Mega Floette
- [ ] Fix the varieties logic in pokeapi.ts to remove duplicates

- [ ] Investigate PokeAPI response for Floette varieties
- [ ] Fix the varieties logic in pokeapi.ts to correctly include Mega Floette without duplicates

- [ ] Analyze the varieties logic in both fetchPokemonVarieties and fetchPokemon
- [ ] Fix the varieties logic in pokeapi.ts to correctly include Mega Floette without duplicates in both functions

- [ ] Remove hardcoded Mega Floette injection in fetchPokemon in pokeapi.ts

- [ ] Locate the exact code causing the duplicate Mega Floette in varieties
- [ ] Remove the duplicate logic while preserving the original API Mega Floette

- [ ] Locate where the varieties array is constructed and returned
- [ ] Add a deduplication step to the varieties array to fix React key warning

- [ ] Locate where the varieties array is constructed in fetchPokemon
- [ ] Add a deduplication step to the varieties array to fix React key warning

- [ ] Analyze the varieties logic in both fetchPokemonVarieties and fetchPokemon
- [ ] Fix the varieties logic in pokeapi.ts to correctly include Mega Floette without duplicates in both functions

- [ ] Compare PokeAPI data and code logic for Malamar and Floette
- [ ] Apply the successful pattern to Floette

- [ ] Locate and fix the syntax error in pokeapi.ts
- [ ] Verify the dev server is running and the fix is applied

- [ ] Analyze the varieties logic in both fetchPokemonVarieties and fetchPokemon
- [ ] Fix the varieties logic in pokeapi.ts to correctly include Mega Floette without duplicates in both functions

- [ ] Add the Gen 9 move "Upper Hand" (快手還擊) to the database and translation mapping

- [ ] Remove the duplicate "Upper Hand" move from moves.json

- [ ] Update the Doubles Tier List with the new 61 Pokemon rankings

- [ ] Correct the 9 misidentified Pokemon in the Doubles Tier List (14, 30, 32, 36, 51, 52, 56, 60, 61)
