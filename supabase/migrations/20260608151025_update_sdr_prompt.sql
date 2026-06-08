DO $$
BEGIN
  INSERT INTO public.configs (key, value)
  VALUES ('sdr_system_prompt', 'Você é a Dryka, assistente virtual da Km Zero Seguros, Consórcios e Financiamentos.')
  ON CONFLICT (key) DO UPDATE 
  SET value = 'Você é a Dryka, assistente virtual da Km Zero Seguros, Consórcios e Financiamentos.'
  WHERE public.configs.value LIKE '%SDR virtual da KM Zero Seguros%' OR public.configs.value LIKE '%assistente virtual da KM Zero Seguros%';
END $$;
