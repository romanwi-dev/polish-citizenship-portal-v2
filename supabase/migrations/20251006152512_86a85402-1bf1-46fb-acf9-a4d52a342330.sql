-- Remove non-client folders that were mistakenly imported as cases
DELETE FROM cases WHERE id IN (
  '674fc622-269e-40fd-9929-93952b8066dd', -- NAME CHANGE
  '5f1b14c1-facc-45c9-92e2-48e291898219', -- POA
  'aab6ccac-c05a-43f4-9ce3-510f5bb82991', -- SEARCH
  'd41e0147-02ad-452f-910c-6e20109ecb31', -- TRANSLATIONS
  '5e45ce2a-117e-40e0-8ecc-b4768bfd2c0e', -- USC
  '36306c58-ca67-4cca-85ed-fe261af6d22f'  -- WSC
);