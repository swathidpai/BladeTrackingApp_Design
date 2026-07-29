const SUB_ASSET_MAP: Record<string, string> = {
  MDA11: "Blade A",
  MDA12: "Blade B",
  MDA13: "Blade C",
};

export interface DerivedAsset {
  asset: string;
  subAsset: string;
}

/**
 * Functional Location is dot-separated: GBCMA.ROB01WF.<TURBINE>.<COMPONENT>.
 * Asset = the 3rd segment with the leading "G" and leading zeros stripped
 * (GA02 -> A2, GH04 -> H4). Sub-asset = the 4th segment mapped from its SAP
 * component code (MDA11 -> Blade A); an unrecognised code is shown as-is
 * rather than guessed. Missing segments resolve to blank, never throw.
 */
export function deriveFromFunctionalLocation(functionalLocation: string): DerivedAsset {
  const segments = (functionalLocation ?? "").split(".");
  const turbineSeg = segments[2] ?? "";
  const componentSeg = segments[3] ?? "";

  let asset = "";
  const match = turbineSeg.match(/^G?([A-Za-z]+)0*(\d+)$/);
  if (match) {
    asset = `${match[1].toUpperCase()}${match[2]}`;
  } else if (turbineSeg) {
    asset = turbineSeg.replace(/^G/i, "");
  }

  const subAsset = SUB_ASSET_MAP[componentSeg.toUpperCase()] ?? componentSeg;

  return { asset, subAsset };
}
