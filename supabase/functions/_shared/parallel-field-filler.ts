/**
 * Parallel PDF Field Population
 * PHASE B - TASK 6: Parallel field filling in batches of 20
 */

interface FillResult {
  totalFields: number;
  filledCount: number;
  emptyFields: string[];
  errors: Array<{ field: string; error: string }>;
}

interface FieldTask {
  pdfFieldName: string;
  dataPath: string;
  value: any;
}

/**
 * Fill PDF fields in parallel batches
 */
export async function fillFieldsInParallel(
  form: any,
  data: any,
  fieldMap: Record<string, string>,
  formatFieldValue: (value: any, fieldName: string) => string,
  getNestedValue: (obj: any, path: string) => any,
  batchSize: number = 20
): Promise<FillResult> {
  const allFields = form.getFields();
  const result: FillResult = {
    totalFields: allFields.length,
    filledCount: 0,
    emptyFields: [],
    errors: [],
  };

  console.log(`[ParallelFiller] Processing ${Object.keys(fieldMap).length} field mappings in batches of ${batchSize}`);

  // Prepare all field tasks
  const tasks: FieldTask[] = [];
  
  for (const [pdfFieldName, dataPath] of Object.entries(fieldMap)) {
    let value: any;
    
    // Handle composite fields (pipe-separated)
    if (dataPath.includes('|')) {
      const parts = dataPath
        .split('|')
        .map(p => getNestedValue(data, p) || '')
        .filter(Boolean);
      value = parts.join(' ');
    } else {
      value = getNestedValue(data, dataPath);
    }

    if (value !== undefined && value !== null && value !== '') {
      tasks.push({ pdfFieldName, dataPath, value });
    } else {
      result.emptyFields.push(pdfFieldName);
    }
  }

  // Process in batches
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(tasks.length / batchSize);

    console.log(`[ParallelFiller] Processing batch ${batchNumber}/${totalBatches} (${batch.length} fields)`);

    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(task => fillSingleField(form, task, formatFieldValue))
    );

    // Collect results
    for (let j = 0; j < batchResults.length; j++) {
      const taskResult = batchResults[j];
      const task = batch[j];

      if (taskResult.status === 'fulfilled' && taskResult.value.success) {
        result.filledCount++;
      } else if (taskResult.status === 'rejected' || !taskResult.value.success) {
        const error = taskResult.status === 'rejected'
          ? taskResult.reason
          : taskResult.value.error;
        result.errors.push({
          field: task.pdfFieldName,
          error: String(error),
        });
      }
    }
  }

  console.log(`[ParallelFiller] Completed: ${result.filledCount}/${tasks.length} fields filled`);
  return result;
}

/**
 * Fill a single PDF field
 */
async function fillSingleField(
  form: any,
  task: FieldTask,
  formatFieldValue: (value: any, fieldName: string) => string
): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedValue = formatFieldValue(task.value, task.pdfFieldName);
    if (!formattedValue) {
      return { success: false, error: 'Empty formatted value' };
    }

    const field = form.getField(task.pdfFieldName);
    if (!field) {
      return { success: false, error: 'Field not found in PDF' };
    }

    const fieldType = field.constructor.name;
    const acroFieldType = field.acroField?.dict?.get('FT')?.encodedName || '';

    // Handle different field types
    const isTextField = fieldType === 'PDFTextField' ||
                       acroFieldType === '/Tx' ||
                       acroFieldType === 'Tx' ||
                       acroFieldType === 't' ||
                       acroFieldType.includes('Tx');

    const isCheckBox = fieldType === 'PDFCheckBox' ||
                      acroFieldType === '/Btn' ||
                      acroFieldType === 'Btn';

    const isDropdown = fieldType === 'PDFDropdown' ||
                      acroFieldType === '/Ch' ||
                      acroFieldType === 'Ch';

    if (isTextField) {
      const uppercaseValue = formattedValue.toUpperCase();
      field.setText(uppercaseValue);
      
      try {
        field.enableBoldFont?.();
      } catch {
        // Bold not supported
      }
      
      return { success: true };
    } else if (isCheckBox) {
      const isChecked = formattedValue.toLowerCase() === 'yes' || 
                       formattedValue === 'true' || 
                       formattedValue === '1';
      if (isChecked) {
        field.check();
      }
      return { success: true };
    } else if (isDropdown) {
      const options = field.getOptions();
      const matchingOption = options.find((opt: string) =>
        opt.toUpperCase() === formattedValue.toUpperCase()
      );
      if (matchingOption) {
        field.select(matchingOption);
      }
      return { success: true };
    }

    return { success: false, error: `Unsupported field type: ${fieldType}` };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
