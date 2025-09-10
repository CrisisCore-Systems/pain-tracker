import { InteractiveBodyMap } from './InteractiveBodyMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../design-system';

interface BodyMappingSectionProps {
  selectedLocations: string[];
  onChange: (locations: string[]) => void;
}

export function BodyMappingSection({ selectedLocations, onChange }: BodyMappingSectionProps) {
  const handleRegionSelect = (regions: string[]) => {
    // Convert region IDs back to readable location names
    const locationNames = regions.map(regionId => {
      return regionIdToLocationName(regionId);
    });
    
    onChange(locationNames);
  };

  const selectedRegions = selectedLocations.map(location => {
    return locationNameToRegionId(location);
  }).filter(Boolean) as string[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pain Location Mapping</CardTitle>
        <CardDescription>
          Click on body regions to mark pain locations
        </CardDescription>
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

// Helper functions to convert between region IDs and location names
function regionIdToLocationName(regionId: string): string {
  const nameMap: Record<string, string> = {
    'head': 'Head',
    'neck': 'Neck',
    'left-shoulder': 'Left Shoulder',
    'right-shoulder': 'Right Shoulder',
    'left-arm': 'Left Arm',
    'right-arm': 'Right Arm',
    'chest': 'Chest',
    'upper-back': 'Upper Back',
    'abdomen': 'Abdomen',
    'lower-back': 'Lower Back',
    'left-hip': 'Left Hip',
    'right-hip': 'Right Hip',
    'left-thigh': 'Left Thigh',
    'right-thigh': 'Right Thigh',
    'left-knee': 'Left Knee',
    'right-knee': 'Right Knee',
    'left-calf': 'Left Calf',
    'right-calf': 'Right Calf',
    'left-foot': 'Left Foot',
    'right-foot': 'Right Foot'
  };
  
  return nameMap[regionId] || regionId;
}

function locationNameToRegionId(locationName: string): string | null {
  const idMap: Record<string, string> = {
    'Head': 'head',
    'Neck': 'neck',
    'Left Shoulder': 'left-shoulder',
    'Right Shoulder': 'right-shoulder',
    'Shoulder': 'left-shoulder', // Default mapping
    'Left Arm': 'left-arm',
    'Right Arm': 'right-arm',
    'Arm': 'left-arm', // Default mapping
    'Chest': 'chest',
    'Upper Back': 'upper-back',
    'Back': 'upper-back', // Default mapping
    'Abdomen': 'abdomen',
    'Stomach': 'abdomen',
    'Lower Back': 'lower-back',
    'Left Hip': 'left-hip',
    'Right Hip': 'right-hip',
    'Hip': 'left-hip', // Default mapping
    'Left Thigh': 'left-thigh',
    'Right Thigh': 'right-thigh',
    'Thigh': 'left-thigh', // Default mapping
    'Left Knee': 'left-knee',
    'Right Knee': 'right-knee',
    'Knee': 'left-knee', // Default mapping
    'Left Calf': 'left-calf',
    'Right Calf': 'right-calf',
    'Calf': 'left-calf', // Default mapping
    'Leg': 'left-calf', // Default mapping
    'Left Foot': 'left-foot',
    'Right Foot': 'right-foot',
    'Foot': 'left-foot' // Default mapping
  };
  
  return idMap[locationName] || null;
}