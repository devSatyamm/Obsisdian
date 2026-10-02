-- ==============================================================================
-- VERITY: Public Claim Intelligence Platform — Seed Dataset
-- File: supabase/seed.sql
-- ==============================================================================
-- Clearly separates demonstrative research case studies from actual regulatory entities.
-- Demonstrative records are explicitly flagged with is_demo_entity = true.
-- ==============================================================================

-- 1. Organisations
insert into public.organisations (
  id, slug, name, category, registration_status, verification_badge,
  website, short_description, executive_summary, aliases, identifiers, is_demo_entity
) values
(
  'a0000000-0000-0000-0000-000000000001',
  'tradegenius-ai-algorithms',
  'TradeGenius AI Algorithms',
  'Algorithmic Trading',
  'Caution Listed by Regulator',
  'Official Regulatory Caution',
  'https://tradegenius-algo.demo-invest.in',
  'High-frequency algorithmic trading subscription promising guaranteed 22% monthly returns on retail demat accounts via Telegram integration.',
  'TradeGenius AI claims to provide automated algo-trading signals through an automated API bridge. In August 2024, the Securities and Exchange Board of India (SEBI) issued an official public advisory identifying the platform as an unregistered investment adviser operating without mandatory registration. Multiple community contributors have corroborated evidence of withdrawal fee surcharges and unfulfilled settlement requests.',
  array['TG Wealth Bot', 'TradeGenius Global Pvt Ltd (Alleged)', 'AlphaPulse VIP'],
  '{"telegramHandles": ["@TradeGeniusOfficial", "@VIP_AlphaReturns"], "domainAge": "Registered July 2024", "pan": "Unverified"}'::jsonb,
  true
),
(
  'a0000000-0000-0000-0000-000000000002',
  'octafx-india',
  'OctaFX / Octa Markets Inc.',
  'Forex & CFD Broker',
  'Caution Listed by Regulator',
  'Official Regulatory Caution',
  'https://octafx.com',
  'Offshore forex and CFD broker actively marketed in India through social media influencers and copy-trading programs without RBI authorization.',
  'OctaFX is prominently listed on the Reserve Bank of India (RBI) Caution Alert List of unauthorized forex trading platforms. Under the Foreign Exchange Management Act (FEMA), 1999, electronic trading platforms facilitating transactions in foreign exchange without prior approval from the RBI are illegal. The Directorate of Enforcement (ED) has conducted searches and attached assets in money laundering investigations related to unauthorized forex trading.',
  array['Octa Markets', 'Octa Trading App', 'OctaFX India Support'],
  '{"rbiRef": "RBI Alert List Item #18", "cin": "Offshore (St. Vincent and the Grenadines)", "domainAge": "Active since 2011"}'::jsonb,
  false
),
(
  'a0000000-0000-0000-0000-000000000003',
  'groww-nextbillion',
  'Groww (Nextbillion Technology Pvt Ltd)',
  'Regulated Depository & Broker',
  'SEBI Registered',
  'Verified Regulatory Record',
  'https://groww.in',
  'Discount stock broker and investment platform regulated by SEBI, offering equities, direct mutual funds, derivatives, and digital gold.',
  'Nextbillion Technology Pvt Ltd (operating as Groww) is a SEBI-registered stockbroker and depository participant with CDSL. It is a member of the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE). Historical technical glitches have been reviewed by exchange grievance panels, with formal circular disclosures documented on public registries.',
  array['Groww Invest Tech', 'Nextbillion Tech'],
  '{"cin": "U65100KA2016PTC092879", "sebiRegNo": "INZ000301838", "domainAge": "Incorporated 2016"}'::jsonb,
  false
),
(
  'a0000000-0000-0000-0000-000000000004',
  'bharat-p2p-high-yield-fund',
  'Bharat P2P High-Yield Fund',
  'P2P Lending',
  'Unregistered',
  'Community Watchlist',
  'https://bharatp2p-yield.demo-invest.in',
  'Unregulated high-yield pooling vehicle soliciting retail deposits promising 18% annual return backed by peer promissory notes.',
  'Bharat P2P claims to operate as a peer-to-peer loan syndicator. However, it does not possess an NBFC-P2P license from the Reserve Bank of India, which is mandatory under the NBFC-P2P Directions, 2017. In October 2024, users flagged delayed principal settlements following regulatory warnings on P2P aggregators.',
  array['Bharat P2P Capital', 'BP2P Yield Multiplier'],
  '{"cin": "Not Found on MCA Portal", "domainAge": "Registered January 2024"}'::jsonb,
  true
),
(
  'a0000000-0000-0000-0000-000000000005',
  'zerodha-broking-ltd',
  'Zerodha Broking Limited',
  'Regulated Depository & Broker',
  'SEBI Registered',
  'Verified Regulatory Record',
  'https://zerodha.com',
  'Retail stock broker and pioneer of discount broking in India, registered with SEBI, NSE, BSE, and MCX.',
  'Zerodha Broking Limited is a registered clearing member and broker in India. It maintains statutory compliance across all financial disclosures.',
  array['Zerodha', 'Kite Broking'],
  '{"cin": "U65929KA2018PLC116577", "sebiRegNo": "INZ000031633", "domainAge": "Incorporated 2010"}'::jsonb,
  false
)
on conflict (slug) do nothing;

-- 2. Official Notices
insert into public.official_notices (
  id, organisation_id, regulator, order_number, notice_type, date_issued, headline, summary, official_pdf_url
) values
(
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'SEBI',
  'WTM/MB/IVD/ID1/2024-25/1109',
  'Caution Notice',
  '2024-08-24',
  'Public Advisory regarding Unregistered Algorithmic Investment Schemes',
  'SEBI alerted investors that TradeGenius AI is neither registered as an Investment Adviser nor as a Research Analyst under SEBI regulations. Promising guaranteed returns on capital is strictly prohibited.',
  'https://www.sebi.gov.in/enforcement/orders/sample-advisory.pdf'
),
(
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  'RBI',
  'DOR.STR.REC.14/02.01.001/2022-23',
  'Advisory Warning',
  '2023-02-10',
  'RBI Alert List of Entities Unauthorized to Deal in Forex',
  'The Reserve Bank reiterated that OctaFX / Octa Markets is not authorized to deal in foreign exchange or operate electronic trading platforms under FEMA regulations.',
  'https://rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=54342'
)
on conflict do nothing;

-- 3. Sources
insert into public.source_records (
  id, organisation_id, title, source_name, source_type, url, publication_date, retrieval_date, tier, snippet
) values
(
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'SEBI Public Cautionary Notice on Unregistered Algo Platforms',
  'Securities and Exchange Board of India (SEBI)',
  'Regulator (SEBI/RBI/MCA)',
  'https://www.sebi.gov.in/public-notices/caution-unregistered-algo-services.html',
  '2024-08-24',
  '2024-08-25',
  1,
  'Investors are cautioned against dealing with entities offering assured/guaranteed returns through algorithmic software or automated bots.'
),
(
  'c0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  'RBI Press Release: Caution against Illegal Forex Trading',
  'Reserve Bank of India',
  'Regulator (SEBI/RBI/MCA)',
  'https://rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=54342',
  '2023-02-10',
  '2023-02-11',
  1,
  'Resident persons undertaking forex transactions on unauthorized ETPs shall render themselves liable for penal action under FEMA.'
)
on conflict do nothing;

-- 4. Claims and Version History
insert into public.claims (
  id, organisation_id, title, category, status
) values
(
  'd0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Monthly Return Guarantee Representation',
  'Marketing Representation',
  'Under review'
),
(
  'd0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  'Regulatory Jurisdictional Authorization Status',
  'Statutory Disclosure',
  'Verified'
)
on conflict do nothing;

insert into public.claim_versions (
  id, claim_id, version_number, statement_text, change_summary, diff_snippet,
  source_id, source_url, source_title, recorded_at, contributor_name, review_state
) values
(
  'e0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  1,
  'TradeGenius algorithm guarantees 22% monthly compounding returns with 100% principal safety on all retail trading accounts.',
  'Initial promotional statement recorded from Telegram broadcast launch campaign.',
  '- Initial baseline recording',
  'c0000000-0000-0000-0000-000000000001',
  'https://t.me/TradeGeniusOfficial/proof',
  'Telegram Promotional Flyer',
  '2024-07-15 10:00:00+00',
  'Priya Sharma',
  'published'
),
(
  'e0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000001',
  2,
  'TradeGenius provides high-frequency educational algorithmic parameters; historical models achieved up to 22% target returns subject to market volatility.',
  'Revised statement following SEBI caution notice removing the unconditional capital guarantee.',
  '- Removed "guarantees 22% monthly compounding returns with 100% principal safety"\n+ Added "educational algorithmic parameters; historical models achieved up to 22% target returns subject to market volatility"',
  'c0000000-0000-0000-0000-000000000001',
  'https://www.sebi.gov.in/public-notices/caution-unregistered-algo-services.html',
  'SEBI Caution Notice & Revised Telegram Disclosures',
  '2024-09-01 14:30:00+00',
  'Vikram Rao, CFA',
  'published'
)
on conflict (claim_id, version_number) do nothing;

-- 5. Evidence Items
insert into public.evidence_items (
  id, organisation_id, claim_id, title, category, description,
  source_id, source_url, submitted_by, verification_state
) values
(
  'f0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Marketing Promise of 22% Guaranteed Monthly ROI',
  'Deceptive Marketing Screenshot',
  'Promotional banner posted across Telegram channels guaranteeing capital safety and fixed 22% monthly compounding yield.',
  'c0000000-0000-0000-0000-000000000001',
  'https://t.me/TradeGeniusOfficial/sample-proof-archive',
  'Priya Sharma (Verified Contributor)',
  'Official Record Verified'
)
on conflict do nothing;

-- 6. Profile Revisions
insert into public.profile_revisions (
  id, organisation_id, version_number, author_name, author_role, summary_of_change, moderated_by, diff_snippet
) values
(
  '10000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  1,
  'Priya Sharma',
  'Verified Contributor',
  'Initial dossier publication with SEBI public advisory reference.',
  'Vikram Rao, CFA',
  '+ Created organization profile for TradeGenius AI Algorithms'
),
(
  '10000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  2,
  'Vikram Rao, CFA',
  'Senior Moderator',
  'Appended withdrawal fee surcharge evidence and revised claim comparison v2.0.',
  'Vikram Rao, CFA',
  '+ Added Claim Version v2.0 with SEBI order comparison diff'
)
on conflict do nothing;
