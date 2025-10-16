-- Enable realtime for messages table so clients can see new messages instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;