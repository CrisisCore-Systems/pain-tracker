// FHIR R4 Compliance Layer for Pain Tracker
// Implements HL7 FHIR standard for healthcare interoperability

import type { PainEntry, EmergencyContact } from '../types';

// FHIR R4 Resource Types
export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
    security?: CodeableConcept[];
    tag?: CodeableConcept[];
  };
  implicitRules?: string;
  language?: string;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface Quantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface Reference {
  reference?: string;
  type?: string;
  identifier?: Identifier;
  display?: string;
}

export interface Identifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: CodeableConcept;
  system?: string;
  value?: string;
  period?: Period;
  assigner?: Reference;
}

export interface Period {
  start?: string;
  end?: string;
}

export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: Period;
}

export interface ContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: Period;
}

export interface Address {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: Period;
}

// Pain-specific FHIR Resources

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status:
    | 'registered'
    | 'preliminary'
    | 'final'
    | 'amended'
    | 'corrected'
    | 'cancelled'
    | 'entered-in-error'
    | 'unknown';
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference;
  encounter?: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  issued?: string;
  performer?: Reference[];
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  interpretation?: CodeableConcept[];
  note?: Annotation[];
  bodySite?: CodeableConcept[];
  method?: CodeableConcept;
  component?: ObservationComponent[];
}

export interface ObservationComponent {
  code: CodeableConcept;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  interpretation?: CodeableConcept[];
}

export interface Annotation {
  authorReference?: Reference;
  authorString?: string;
  time?: string;
  text: string;
}

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Address[];
  contact?: PatientContact[];
}

export interface PatientContact {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  period?: Period;
}

export interface FHIRQuestionnaireResponse extends FHIRResource {
  resourceType: 'QuestionnaireResponse';
  identifier?: Identifier;
  basedOn?: Reference[];
  partOf?: Reference[];
  questionnaire?: string;
  status: 'in-progress' | 'completed' | 'amended' | 'entered-in-error' | 'stopped';
  subject?: Reference;
  encounter?: Reference;
  authored?: string;
  author?: Reference;
  source?: Reference;
  item?: QuestionnaireResponseItem[];
}

export interface QuestionnaireResponseItem {
  linkId: string;
  definition?: string;
  text?: string;
  answer?: QuestionnaireResponseAnswer[];
  item?: QuestionnaireResponseItem[];
}

export interface QuestionnaireResponseAnswer {
  valueBoolean?: boolean;
  valueDecimal?: number;
  valueInteger?: number;
  valueDate?: string;
  valueDateTime?: string;
  valueTime?: string;
  valueString?: string;
  valueQuantity?: Quantity;
  item?: QuestionnaireResponseItem[];
}

export interface FHIRBundle extends FHIRResource {
  resourceType: 'Bundle';
  type:
    | 'document'
    | 'message'
    | 'transaction'
    | 'transaction-response'
    | 'batch'
    | 'batch-response'
    | 'history'
    | 'searchset'
    | 'collection';
  timestamp?: string;
  total?: number;
  link?: BundleLink[];
  entry?: BundleEntry[];
}

export interface BundleLink {
  relation: string;
  url: string;
}

export interface BundleEntry {
  link?: BundleLink[];
  fullUrl?: string;
  resource?: FHIRResource;
  search?: {
    mode?: 'match' | 'include' | 'outcome';
    score?: number;
  };
  request?: {
    method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    ifNoneMatch?: string;
    ifModifiedSince?: string;
    ifMatch?: string;
    ifNoneExist?: string;
  };
  response?: {
    status: string;
    location?: string;
    etag?: string;
    lastModified?: string;
  };
}

// FHIR Validation Response
export interface FHIRValidationResult {
  resourceType: 'OperationOutcome';
  issue?: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    diagnostics?: string;
    location?: string[];
  }>;
}

// FHIR Service Implementation
export class FHIRService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string = '', apiKey: string = '') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.headers = {
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    };
  }

  // Convert Pain Entry to FHIR Observation
  painEntryToFHIRObservation(entry: PainEntry, patientId?: string): FHIRObservation {
    const painObservation: FHIRObservation = {
      resourceType: 'Observation',
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'survey',
              display: 'Survey',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '72133-2',
            display: 'Pain severity Wong-Baker FACES Scale',
          },
        ],
      },
      subject: patientId ? { reference: `Patient/${patientId}` } : undefined,
      effectiveDateTime: entry.timestamp,
      valueQuantity: {
        value: entry.baselineData.pain,
        unit: 'score',
        system: 'http://unitsofmeasure.org',
        code: '{score}',
      },
      component: [],
    };

    // Add body sites
    if (entry.baselineData.locations && entry.baselineData.locations.length > 0) {
      painObservation.bodySite = entry.baselineData.locations.map(location => ({
        text: location,
      }));
    }

    // Add symptoms as components
    if (entry.baselineData.symptoms && entry.baselineData.symptoms.length > 0) {
      painObservation.component?.push({
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '404684003',
              display: 'Clinical finding',
            },
          ],
        },
        valueString: entry.baselineData.symptoms.join(', '),
      });
    }

    // Add functional impact
    if (
      entry.functionalImpact &&
      entry.functionalImpact.limitedActivities &&
      entry.functionalImpact.limitedActivities.length > 0
    ) {
      painObservation.component?.push({
        code: {
          text: 'Limited Activities',
        },
        valueString: entry.functionalImpact.limitedActivities.join(', '),
      });
    }

    // Add sleep quality
    if (entry.qualityOfLife && entry.qualityOfLife.sleepQuality !== undefined) {
      painObservation.component?.push({
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '72170-4',
              display: 'Sleep quality',
            },
          ],
        },
        valueQuantity: {
          value: entry.qualityOfLife.sleepQuality,
          unit: 'score',
          system: 'http://unitsofmeasure.org',
          code: '{score}',
        },
      });
    }

    // Add mood impact
    if (entry.qualityOfLife && entry.qualityOfLife.moodImpact !== undefined) {
      painObservation.component?.push({
        code: {
          text: 'Mood Impact',
        },
        valueQuantity: {
          value: entry.qualityOfLife.moodImpact,
          unit: 'score',
          system: 'http://unitsofmeasure.org',
          code: '{score}',
        },
      });
    }

    // Add notes
    if (entry.notes) {
      painObservation.note = [
        {
          text: entry.notes,
          time: entry.timestamp,
        },
      ];
    }

    return painObservation;
  }

  // Convert multiple pain entries to FHIR Bundle
  painEntriesToFHIRBundle(entries: PainEntry[], patientId?: string): FHIRBundle {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      total: entries.length,
      entry: entries.map(entry => ({
        fullUrl: `urn:uuid:pain-observation-${entry.id}`,
        resource: this.painEntryToFHIRObservation(entry, patientId),
      })),
    };

    return bundle;
  }

  // Convert Emergency Contact to FHIR Patient Contact
  emergencyContactToFHIRContact(contact: EmergencyContact): PatientContact {
    return {
      relationship: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
              code: contact.isHealthcareProvider ? 'PR' : 'C',
              display: contact.isHealthcareProvider ? 'Healthcare Provider' : 'Emergency Contact',
            },
          ],
          text: contact.relationship,
        },
      ],
      name: {
        text: contact.name,
      },
      telecom: [
        {
          system: 'phone',
          value: contact.phoneNumber,
          use: 'mobile',
        },
        ...(contact.email
          ? [
              {
                system: 'email' as const,
                value: contact.email,
              },
            ]
          : []),
      ],
      ...(contact.address && {
        address: {
          text: contact.address,
        },
      }),
    };
  }

  // Create Pain Assessment Questionnaire Response
  createPainAssessmentResponse(entry: PainEntry, patientId?: string): FHIRQuestionnaireResponse {
    return {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      subject: patientId ? { reference: `Patient/${patientId}` } : undefined,
      authored: entry.timestamp,
      questionnaire: 'http://paintracker.app/questionnaires/pain-assessment',
      item: [
        {
          linkId: 'pain-level',
          text: 'Current pain level (0-10)',
          answer: [
            {
              valueInteger: entry.baselineData.pain,
            },
          ],
        },
        {
          linkId: 'pain-locations',
          text: 'Pain locations',
          answer: (entry.baselineData.locations || []).map(location => ({
            valueString: location,
          })),
        },
        {
          linkId: 'symptoms',
          text: 'Associated symptoms',
          answer: (entry.baselineData.symptoms || []).map(symptom => ({
            valueString: symptom,
          })),
        },
        {
          linkId: 'sleep-quality',
          text: 'Sleep quality (0-10)',
          answer:
            entry.qualityOfLife?.sleepQuality !== undefined
              ? [
                  {
                    valueInteger: entry.qualityOfLife.sleepQuality,
                  },
                ]
              : [],
        },
        {
          linkId: 'mood-impact',
          text: 'Mood impact (0-10)',
          answer:
            entry.qualityOfLife?.moodImpact !== undefined
              ? [
                  {
                    valueInteger: entry.qualityOfLife.moodImpact,
                  },
                ]
              : [],
        },
        {
          linkId: 'functional-limitations',
          text: 'Functional limitations',
          answer: (entry.functionalImpact?.limitedActivities || []).map(activity => ({
            valueString: activity,
          })),
        },
        {
          linkId: 'medications',
          text: 'Current medications',
          answer: (entry.medications?.current || []).map(med => ({
            valueString: `${med.name} ${med.dosage} ${med.frequency}`,
          })),
        },
        ...(entry.notes
          ? [
              {
                linkId: 'additional-notes',
                text: 'Additional notes',
                answer: [
                  {
                    valueString: entry.notes,
                  },
                ],
              },
            ]
          : []),
      ],
    };
  }

  // API Methods for FHIR Server Integration
  async createResource(resource: FHIRResource): Promise<FHIRResource> {
    const response = await fetch(`${this.baseUrl}/${resource.resourceType}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(resource),
    });

    if (!response.ok) {
      throw new Error(`FHIR API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async updateResource(resource: FHIRResource): Promise<FHIRResource> {
    if (!resource.id) {
      throw new Error('Resource must have an ID for update operation');
    }

    const response = await fetch(`${this.baseUrl}/${resource.resourceType}/${resource.id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(resource),
    });

    if (!response.ok) {
      throw new Error(`FHIR API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getResource(resourceType: string, id: string): Promise<FHIRResource> {
    const response = await fetch(`${this.baseUrl}/${resourceType}/${id}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`FHIR API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async searchResources(resourceType: string, params: Record<string, string>): Promise<FHIRBundle> {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseUrl}/${resourceType}?${searchParams}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`FHIR API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async deleteResource(resourceType: string, id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${resourceType}/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`FHIR API Error: ${response.status} ${response.statusText}`);
    }
  }

  // Bulk operations
  async submitBundle(bundle: FHIRBundle): Promise<FHIRBundle> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(bundle),
    });

    if (!response.ok) {
      throw new Error(`FHIR API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Validation
  async validateResource(resource: FHIRResource): Promise<FHIRValidationResult> {
    const response = await fetch(`${this.baseUrl}/${resource.resourceType}/$validate`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(resource),
    });

    if (!response.ok) {
      throw new Error(`FHIR API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

// Export singleton instance
export const fhirService = new FHIRService();
