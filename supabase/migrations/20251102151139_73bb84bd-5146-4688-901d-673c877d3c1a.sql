-- Create function to auto-apply OCR data to forms when OCR completes
CREATE OR REPLACE FUNCTION public.auto_apply_ocr_to_forms()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if OCR just completed and data hasn't been applied yet
  IF NEW.ocr_status = 'completed' 
     AND (OLD.ocr_status IS NULL OR OLD.ocr_status != 'completed')
     AND (NEW.data_applied_to_forms IS NULL OR NEW.data_applied_to_forms = false)
  THEN
    -- Log the auto-apply trigger
    INSERT INTO public.hac_logs (
      case_id,
      action_type,
      action_description,
      field_changed,
      old_value,
      new_value
    ) VALUES (
      NEW.case_id,
      'ocr_auto_apply',
      'Triggering auto-apply OCR data to forms',
      'data_applied_to_forms',
      'false',
      'pending'
    );

    -- Call the apply-ocr-to-forms edge function asynchronously
    -- Note: This requires pg_net extension to be enabled
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/apply-ocr-to-forms',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'documentId', NEW.id::text,
        'caseId', NEW.case_id::text,
        'overwriteManual', false
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on documents table
DROP TRIGGER IF EXISTS trigger_auto_apply_ocr ON public.documents;
CREATE TRIGGER trigger_auto_apply_ocr
  AFTER UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_apply_ocr_to_forms();

-- Create function to auto-assign translators when translation request is created
CREATE OR REPLACE FUNCTION public.auto_assign_translator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_translator_id UUID;
BEGIN
  -- Only proceed if not already assigned
  IF NEW.assigned_translator_id IS NULL AND NEW.status = 'pending' THEN
    -- Find best translator for this language pair
    SELECT id INTO selected_translator_id
    FROM public.sworn_translators
    WHERE languages @> ARRAY[NEW.source_language, NEW.target_language]
      AND is_active = true
    ORDER BY 
      rating DESC,
      total_jobs_completed ASC -- Prefer translators with lower workload
    LIMIT 1;

    -- If translator found, assign them
    IF selected_translator_id IS NOT NULL THEN
      NEW.assigned_translator_id := selected_translator_id;
      NEW.status := 'assigned';
      NEW.assigned_at := NOW();

      -- Create task for translator
      INSERT INTO public.tasks (
        case_id,
        title,
        description,
        assignee_role,
        status,
        deadline,
        metadata
      ) VALUES (
        NEW.case_id,
        'Translate document: ' || (SELECT name FROM public.documents WHERE id = NEW.document_id),
        'Translate from ' || NEW.source_language || ' to ' || NEW.target_language,
        'translator',
        'pending',
        NOW() + INTERVAL '7 days',
        jsonb_build_object(
          'translation_request_id', NEW.id,
          'translator_id', selected_translator_id,
          'document_id', NEW.document_id
        )
      );

      -- Log assignment
      INSERT INTO public.hac_logs (
        case_id,
        action_type,
        action_description,
        field_changed,
        new_value
      ) VALUES (
        NEW.case_id,
        'translation_auto_assign',
        'Auto-assigned translator for ' || NEW.source_language || ' to ' || NEW.target_language,
        'assigned_translator_id',
        selected_translator_id::text
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on translation_requests table
DROP TRIGGER IF EXISTS trigger_auto_assign_translator ON public.translation_requests;
CREATE TRIGGER trigger_auto_assign_translator
  BEFORE INSERT ON public.translation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_translator();