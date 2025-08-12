import { validatePain } from './validation';
import { wcbSubmit } from './api-client';

export async function submitPain(raw: any) {
  try {
    const valid = validatePain(raw);
    // Convert single pain entry to submission format
    const submissionData = {
      painEntries: [valid],
      reportType: 'pain-tracking' as const
    };
    await wcbSubmit(submissionData);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
