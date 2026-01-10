/**
 * Minimal FHIR R4 type definitions for Pain Tracker EMR integration.
 * Subset of HL7 FHIR R4 specification.
 */

/* eslint-disable @typescript-eslint/no-namespace */
export namespace Fhir {
  export interface Bundle {
    resourceType: 'Bundle';
    type: 'collection' | 'transaction' | 'document';
    timestamp?: string;
    entry?: Array<{
      resource: FhirResource;
    }>;
  }

  export type FhirResource = 
    | Observation 
    | MedicationStatement 
    | ClinicalImpression 
    | Patient;

  export interface Element {
    id?: string;
    extension?: Extension[];
  }

  export interface Extension {
    url: string;
    valueString?: string;
    valueCode?: string;
    valueInteger?: number;
    valueBoolean?: boolean;
    valueDateTime?: string;
  }

  export interface Resource extends Element {
    resourceType: string;
    id?: string;
    meta?: Meta;
    implicitRules?: string;
    language?: string;
  }

  export interface Meta {
    versionId?: string;
    lastUpdated?: string;
    source?: string;
    profile?: string[];
  }

  export interface Observation extends Resource {
    resourceType: 'Observation';
    status: 'registered' | 'preliminary' | 'final' | 'amended';
    code: CodeableConcept;
    subject?: Reference;
    effectiveDateTime?: string;
    valueInteger?: number;
    valueString?: string;
    bodySite?: CodeableConcept;
    method?: CodeableConcept;
    note?: Annotation[];
  }

  export interface MedicationStatement extends Resource {
    resourceType: 'MedicationStatement';
    status: 'active' | 'completed' | 'entered-in-error';
    medicationCodeableConcept?: CodeableConcept;
    subject: Reference;
    dateAsserted?: string;
    dosage?: Dosage[];
  }

  export interface ClinicalImpression extends Resource {
    resourceType: 'ClinicalImpression';
    status: 'in-progress' | 'completed' | 'entered-in-error';
    subject: Reference;
    effectiveDateTime?: string;
    summary?: string;
  }

  export interface Patient extends Resource {
    resourceType: 'Patient';
    identifier?: Identifier[];
    active?: boolean;
    name?: HumanName[];
  }

  // Supporting types
  
  export interface CodeableConcept {
    coding?: Coding[];
    text?: string;
  }

  export interface Coding {
    system?: string;
    version?: string;
    code?: string;
    display?: string;
  }

  export interface Reference {
    reference?: string;
    type?: string;
    display?: string;
  }

  export interface Annotation {
    text: string;
    time?: string;
  }

  export interface Dosage {
    text?: string;
    timing?: any;
    doseAndRate?: any[];
  }

  export interface Identifier {
    use?: 'usual' | 'official' | 'temp';
    system?: string;
    value?: string;
  }

  export interface HumanName {
    use?: string;
    text?: string;
    family?: string;
    given?: string[];
  }
}
