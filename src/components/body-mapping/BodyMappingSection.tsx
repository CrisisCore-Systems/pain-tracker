import { InteractiveBodyMap } from './InteractiveBodyMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../design-system';
import { REGION_TO_LOCATION_MAP, regionsToLocations, locationsToRegions } from './index';

interface BodyMappingSectionProps {
  selectedLocations: string[];
  onChange: (locations: string[]) => void;
}

export function BodyMappingSection({ selectedLocations, onChange }: BodyMappingSectionProps) {
  const handleRegionSelect = (regions: string[]) => {
    // Convert region IDs back to readable location names
    const locationNames = regionsToLocations(regions);
    onChange(locationNames);
  };

  const selectedRegions = locationsToRegions(selectedLocations);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pain Location Mapping</CardTitle>
        <CardDescription>Click on body regions to mark pain locations</CardDescription>
      </CardHeader>
      <CardContent>
        <InteractiveBodyMap
          selectedRegions={selectedRegions}
          onRegionSelect={handleRegionSelect}
          mode="selection"
        />
      </CardContent>
    </Card>
  );
}
