import { validatePain } from './validation';
import { wcbSubmit } from './api-client';

export async function submitPain(raw: unknown) {
  try {
    const valid = validatePain(raw);
    // Convert single pain entry to submission format
    const submissionData = {
      painEntries: [valid],
      reportType: 'pain-tracking' as const,
    };
    await wcbSubmit(submissionData);
    return { success: true };
  } catch (e: unknown) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
}
