// The Sanctuary celebrates level-ups on the slime itself, so the global level-up banners
// stay quiet while it is open. A module flag is enough: nothing renders from it.
let sanctuaryOpen = false;

export function setSanctuaryOpen(open: boolean) {
  sanctuaryOpen = open;
}

export function isSanctuaryOpen(): boolean {
  return sanctuaryOpen;
}
