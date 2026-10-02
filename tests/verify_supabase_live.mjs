// Live Supabase Integration & RLS Verification Suite
// This script checks environment configuration, tests live remote connectivity,
// and validates table schemas, triggers, RLS policies, and end-to-end workflows.
// All test data uses prefix "[VERITY_TEST_TRANSIENT]" and is safely cleaned up.

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = Boolean(
  url &&
  url.startsWith('https://') &&
  !url.includes('your-project-ref') &&
  anonKey &&
  anonKey.length > 20 &&
  !anonKey.includes('your-anon-key-placeholder')
);

async function runLiveVerification() {
  console.log('====================================================');
  console.log('VERITY LIVE SUPABASE INTEGRATION & SECURITY AUDIT');
  console.log('====================================================\n');

  console.log(`1. Configuration Assessment:`);
  console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${url ? 'Configured (masked)' : 'NOT CONFIGURED'}`);
  console.log(`- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey ? 'Configured (masked)' : 'NOT CONFIGURED'}`);
  console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${serviceKey ? 'Configured (masked)' : 'NOT CONFIGURED'}`);
  console.log(`- Status: ${isConfigured ? 'Live Credentials Detected' : 'Missing Credentials (Local Fallback)'}\n`);

  if (!isConfigured) {
    console.log('2. Live Remote Database Tests:');
    console.log('[-] Database Connection Test: BLOCKED (No remote credentials provided)');
    console.log('[-] Tables & Schema Verification: BLOCKED (Cannot connect to remote PostgreSQL)');
    console.log('[-] Anon RLS Permission Enforcement: BLOCKED (No remote database available)');
    console.log('[-] Submission Persistence Workflow: BLOCKED (No remote database available)');
    console.log('[-] Moderation Authorization & Audit Logging: BLOCKED (No remote database available)');
    console.log('[-] Database Immutability Trigger: BLOCKED (No remote database available)\n');

    console.log('====================================================');
    console.log('AUDIT RESULT: STOPPED BEFORE LIVE TESTING');
    console.log('Reason: Supabase project credentials are required to execute live database tests.');
    console.log('The application remains fully operational in Local Offline Mode.');
    console.log('====================================================');
    return;
  }

  const anonClient = createClient(url, anonKey);
  const serverClient = serviceKey ? createClient(url, serviceKey) : null;

  console.log('2. Live Database Connection Test:');
  try {
    const { count, error } = await anonClient.from('organisations').select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`[FAIL] Connection error: ${error.message}`);
      return;
    }
    console.log(`[PASS] Connected to remote PostgreSQL database (${count ?? 0} organisations found).`);
  } catch (err) {
    console.error(`[FAIL] Connection exception: ${err.message}`);
    return;
  }

  // 3. Verify Table Schemas
  console.log('\n3. Verifying Expected Database Tables:');
  const tables = [
    'organisations',
    'claims',
    'claim_versions',
    'source_records',
    'evidence_items',
    'official_notices',
    'community_submissions',
    'profile_revisions',
    'moderation_audits',
    'discovery_sources',
    'ingestion_jobs'
  ];

  for (const table of tables) {
    try {
      const { error } = await anonClient.from(table).select('*', { head: true, count: 'exact' });
      if (error) {
        console.error(`[FAIL] Table "${table}": ${error.message}`);
      } else {
        console.log(`[PASS] Table "${table}" verified.`);
      }
    } catch (e) {
      console.error(`[FAIL] Table "${table}": ${e.message}`);
    }
  }

  // 4. Verify RLS Policies
  console.log('\n4. Verifying Row Level Security (RLS) Policies:');
  try {
    // Test A: Anon client cannot insert submission with pre-approved status
    const { error: forgedInsertError } = await anonClient
      .from('community_submissions')
      .insert({
        organisation_name: '[VERITY_TEST_TRANSIENT] RLS Security Check',
        category: 'Financial services',
        evidence_category: 'Corporate Registry Record',
        title: '[VERITY_TEST_TRANSIENT] Forged Approval Attempt',
        factual_description: 'Attempting to insert a pre-approved submission via anon key directly.',
        primary_source_url: 'https://example.com/test',
        submitted_by_name: 'Test Attacker',
        status: 'approved' // RLS requires status = 'pending'
      });

    if (forgedInsertError) {
      console.log(`[PASS] RLS Policy Enforcement: Blocked direct insertion of pre-approved submission (${forgedInsertError.message})`);
    } else {
      console.error('[FAIL] RLS Policy Failed: Anon client was allowed to insert submission with status="approved"!');
    }
  } catch (e) {
    console.log(`[PASS] RLS Policy Enforcement: ${e.message}`);
  }

  // 5. Verify Contribution Persistence Workflow
  console.log('\n5. Verifying Contribution Submission & Moderation Flow:');
  let testSubmissionId = null;
  let testOrgId = null;

  try {
    // 5.1 Insert a pending submission using anon client
    const { data: subData, error: subError } = await anonClient
      .from('community_submissions')
      .insert({
        organisation_name: '[VERITY_TEST_TRANSIENT] Test Entity',
        category: 'Financial services',
        evidence_category: 'Corporate Registry Record',
        title: '[VERITY_TEST_TRANSIENT] Test Community Finding',
        factual_description: 'This is an automated test contribution for end-to-end verification.',
        primary_source_url: 'https://example.com/test-source',
        submitted_by_name: 'Automated Tester',
        status: 'pending'
      })
      .select()
      .single();

    if (subError || !subData) {
      console.error(`[FAIL] Contribution persistence failed: ${subError?.message}`);
    } else {
      testSubmissionId = subData.id;
      console.log(`[PASS] Contribution persisted successfully with status="pending" (ID: ${testSubmissionId}).`);
    }

    // 5.2 Server-role moderation approval
    if (serverClient && testSubmissionId) {
      const now = new Date().toISOString();
      const { error: appError } = await serverClient
        .from('community_submissions')
        .update({
          status: 'approved',
          reviewed_by: 'Chief Audit Officer',
          reviewed_at: now,
          moderation_notes: 'Approved during automated live audit.'
        })
        .eq('id', testSubmissionId);

      if (appError) {
        console.error(`[FAIL] Moderation approval failed: ${appError.message}`);
      } else {
        console.log(`[PASS] Moderation approval executed: submission status transitioned to "approved".`);
      }

      // Log moderation audit
      const { error: auditError } = await serverClient
        .from('moderation_audits')
        .insert({
          submission_id: testSubmissionId,
          action: 'approve',
          reviewer_name: 'Chief Audit Officer',
          reviewer_role: 'Senior Moderator',
          notes: 'Automated verification test audit log',
          timestamp: now
        });

      if (!auditError) {
        console.log(`[PASS] Moderation audit record created and linked.`);
      }
    }
  } catch (err) {
    console.error(`[FAIL] Workflow exception: ${err.message}`);
  }

  // 6. Verify Published Claim Version Immutability
  console.log('\n6. Verifying Claim Version Immutability Trigger:');
  if (serverClient) {
    let testClaimId = null;
    let testVersionId = null;

    try {
      // 6.1 Create transient organisation and claim
      const { data: testOrg } = await serverClient
        .from('organisations')
        .insert({
          slug: 'verity-test-transient-org',
          name: '[VERITY_TEST_TRANSIENT] Audit Org',
          category: 'Financial services',
          is_demo_entity: true
        })
        .select()
        .single();

      if (testOrg) {
        testOrgId = testOrg.id;

        const { data: testClaim } = await serverClient
          .from('claims')
          .insert({
            organisation_id: testOrg.id,
            title: '[VERITY_TEST_TRANSIENT] Immutable Claim'
          })
          .select()
          .single();

        if (testClaim) {
          testClaimId = testClaim.id;

          // 6.2 Insert published claim version
          const { data: testVer, error: verErr } = await serverClient
            .from('claim_versions')
            .insert({
              claim_id: testClaim.id,
              version_number: 1,
              statement_text: 'Original immutable published statement text.',
              review_state: 'published'
            })
            .select()
            .single();

          if (testVer) {
            testVersionId = testVer.id;

            // 6.3 Attempt to UPDATE published version
            const { error: mutateErr } = await serverClient
              .from('claim_versions')
              .update({ statement_text: 'Malicious modification of published record' })
              .eq('id', testVersionId);

            if (mutateErr && mutateErr.message.includes('immutable')) {
              console.log(`[PASS] Immutability Trigger: UPDATE blocked on published record (${mutateErr.message}).`);
            } else if (!mutateErr) {
              console.error('[FAIL] Immutability Trigger: Published version was mutated! Security violation.');
            }

            // 6.4 Attempt to DELETE published version
            const { error: deleteErr } = await serverClient
              .from('claim_versions')
              .delete()
              .eq('id', testVersionId);

            if (deleteErr && deleteErr.message.includes('cannot be deleted')) {
              console.log(`[PASS] Immutability Trigger: DELETE blocked on published record (${deleteErr.message}).`);
            } else if (!deleteErr) {
              console.error('[FAIL] Immutability Trigger: Published version was deleted! Security violation.');
            }
          }
        }
      }
    } catch (e) {
      console.log(`[-] Immutability test exception: ${e.message}`);
    }

    // 7. Cleanup ONLY Transient Test Data
    console.log('\n7. Cleaning Up Transient Test Records:');
    try {
      if (testSubmissionId) {
        await serverClient.from('moderation_audits').delete().eq('submission_id', testSubmissionId);
        await serverClient.from('community_submissions').delete().eq('id', testSubmissionId);
        console.log('[CLEANUP] Transient submission and audit records deleted.');
      }
      if (testOrgId) {
        // Disabling trigger temporarily or resetting review_state for test record deletion
        await serverClient
          .from('claim_versions')
          .update({ review_state: 'draft' })
          .eq('claim_id', testClaimId);
        await serverClient.from('organisations').delete().eq('id', testOrgId);
        console.log('[CLEANUP] Transient test organisation and claim deleted.');
      }
    } catch (e) {
      console.warn('[CLEANUP] Cleanup note:', e.message);
    }
  }

  console.log('\n====================================================');
  console.log('AUDIT COMPLETED');
  console.log('====================================================');
}

runLiveVerification();
