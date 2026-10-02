import {
  EntityProfile,
  CommunitySubmission,
  UserPersona,
  ModerationStatus,
  EntityCategory,
  RegistrationStatus,
  Claim
} from '../types';
import { INITIAL_ENTITIES, INITIAL_SUBMISSIONS, DEMO_PERSONAS } from '../data/mockData';
import { isSupabaseConfigured } from '../supabase';
import { ClaimPollData, CommunityVoteOption, AssessmentRevision, AssessmentLabel } from '../search/types';

const STORAGE_KEYS = {
  ENTITIES: 'verity_entities_v2',
  SUBMISSIONS: 'verity_submissions_v2',
  ACTIVE_USER: 'verity_active_user_v2',
  DATA_SOURCE: 'verity_data_source_v2'
};

export interface ClaimVoteRecord {
  id: string;
  pollId: string;
  claimId: string;
  claimVersion: number;
  userId: string;
  voteOption: CommunityVoteOption;
  rationale?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimPollRecord {
  id: string;
  claimId: string;
  claimVersion: number;
  claimTitle: string;
  statementText: string;
  status: 'active' | 'archived' | 'superseded';
  createdAt: string;
}

// In-memory fallback for SSR and server runtime
let memoryEntities: EntityProfile[] = [...INITIAL_ENTITIES];
let memorySubmissions: CommunitySubmission[] = [...INITIAL_SUBMISSIONS];
let memoryActiveUser: UserPersona = DEMO_PERSONAS.contributor;
let currentDataSource: 'supabase' | 'local_demo' = isSupabaseConfigured ? 'supabase' : 'local_demo';
let memoryPolls = new Map<string, ClaimPollRecord>();
let memoryVotes = new Map<string, ClaimVoteRecord>();
let memoryAssessmentRevisions = new Map<string, AssessmentRevision[]>();

function getStoredEntities(): EntityProfile[] {
  if (typeof window === 'undefined') return memoryEntities;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ENTITIES, JSON.stringify(INITIAL_ENTITIES));
      return INITIAL_ENTITIES;
    }
    return JSON.parse(raw);
  } catch {
    return memoryEntities;
  }
}

function saveStoredEntities(entities: EntityProfile[]) {
  memoryEntities = entities;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTITIES, JSON.stringify(entities));
      window.dispatchEvent(new Event('verity_data_updated'));
    } catch (e) {
      console.error('Failed to save entities to localStorage', e);
    }
  }
}

function getStoredSubmissions(): CommunitySubmission[] {
  if (typeof window === 'undefined') return memorySubmissions;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return memorySubmissions;
  }
}

function saveStoredSubmissions(submissions: CommunitySubmission[]) {
  memorySubmissions = submissions;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
      window.dispatchEvent(new Event('verity_data_updated'));
    } catch (e) {
      console.error('Failed to save submissions to localStorage', e);
    }
  }
}

// Background sync from API if running in browser
let hasInitializedSync = false;
async function initializeClientSync() {
  if (typeof window === 'undefined' || hasInitializedSync) return;
  hasInitializedSync = true;

  try {
    // 1. Check DB health
    const healthRes = await fetch('/api/health/db');
    if (healthRes.ok) {
      const health = await healthRes.json();
      if (health.connected) {
        currentDataSource = 'supabase';
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.DATA_SOURCE, 'supabase');
        }

        // 2. Fetch live organisations
        const orgsRes = await fetch('/api/organisations');
        if (orgsRes.ok) {
          const { data } = await orgsRes.json();
          if (Array.isArray(data) && data.length > 0) {
            saveStoredEntities(data);
          }
        }

        // 3. Fetch live submissions
        const subsRes = await fetch('/api/submissions');
        if (subsRes.ok) {
          const { data } = await subsRes.json();
          if (Array.isArray(data)) {
            saveStoredSubmissions(data);
          }
        }
      }
    }
  } catch (err) {
    console.debug('Background Supabase hydration skipped (local mode active):', err);
  }
}

// Trigger initial sync in browser
if (typeof window !== 'undefined') {
  initializeClientSync();
}

export const repository = {
  getDataSource(): 'supabase' | 'local_demo' {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.DATA_SOURCE);
      if (stored === 'supabase') return 'supabase';
    }
    return currentDataSource;
  },

  isSupabaseActive(): boolean {
    return this.getDataSource() === 'supabase';
  },

  async syncFromBackend(): Promise<{ success: boolean; source: string }> {
    try {
      const healthRes = await fetch('/api/health/db');
      if (!healthRes.ok) throw new Error('Health check failed');
      const health = await healthRes.json();

      if (health.connected) {
        currentDataSource = 'supabase';
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.DATA_SOURCE, 'supabase');
        }

        const orgsRes = await fetch('/api/organisations');
        if (orgsRes.ok) {
          const { data } = await orgsRes.json();
          if (Array.isArray(data)) saveStoredEntities(data);
        }

        const subsRes = await fetch('/api/submissions');
        if (subsRes.ok) {
          const { data } = await subsRes.json();
          if (Array.isArray(data)) saveStoredSubmissions(data);
        }

        return { success: true, source: 'supabase' };
      }
      return { success: false, source: 'local_demo' };
    } catch {
      return { success: false, source: 'local_demo' };
    }
  },

  getEntities(): EntityProfile[] {
    return getStoredEntities();
  },

  getEntityBySlug(slug: string): EntityProfile | undefined {
    const list = getStoredEntities();
    return list.find((e) => e.slug === slug || e.id === slug);
  },

  async fetchEntityBySlugAsync(slug: string): Promise<EntityProfile | undefined> {
    try {
      const res = await fetch(`/api/organisations/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const { data } = await res.json();
        if (data) {
          // Update in stored list if present
          const current = getStoredEntities();
          const idx = current.findIndex((e) => e.id === data.id || e.slug === data.slug);
          if (idx !== -1) {
            current[idx] = data;
          } else {
            current.push(data);
          }
          saveStoredEntities(current);
          return data;
        }
      }
    } catch (err) {
      console.debug('Failed to fetch entity from API:', err);
    }
    return this.getEntityBySlug(slug);
  },

  searchEntities(params: {
    query?: string;
    category?: EntityCategory | 'All';
    status?: RegistrationStatus | 'All';
    hasNoticesOnly?: boolean;
  }): EntityProfile[] {
    const { query = '', category = 'All', status = 'All', hasNoticesOnly = false } = params;
    const lowerQuery = query.toLowerCase().trim();

    return getStoredEntities().filter((entity) => {
      // Query search
      if (lowerQuery) {
        const matchesName = entity.name.toLowerCase().includes(lowerQuery);
        const matchesAliases = entity.aliases.some((a) => a.toLowerCase().includes(lowerQuery));
        const matchesDesc = entity.shortDescription.toLowerCase().includes(lowerQuery);
        const matchesCategory = entity.category.toLowerCase().includes(lowerQuery);
        if (!matchesName && !matchesAliases && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      // Category filter
      if (category !== 'All' && entity.category !== category) {
        return false;
      }

      // Status filter
      if (status !== 'All' && entity.registrationStatus !== status) {
        return false;
      }

      // Notice filter
      if (hasNoticesOnly && entity.notices.length === 0) {
        return false;
      }

      return true;
    });
  },

  getSubmissions(status?: ModerationStatus): CommunitySubmission[] {
    const list = getStoredSubmissions();
    if (!status) return list;
    return list.filter((s) => s.status === status);
  },

  createSubmission(submission: Omit<CommunitySubmission, 'id' | 'status' | 'submittedAt'>): CommunitySubmission {
    const newRecord: CommunitySubmission = {
      ...submission,
      id: `sub_${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    const current = getStoredSubmissions();
    saveStoredSubmissions([newRecord, ...current]);

    // Send async write to API endpoint in background
    if (typeof window !== 'undefined') {
      fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      })
        .then(async (res) => {
          if (res.ok) {
            const result = await res.json();
            if (result.submission && result.submission.id) {
              // Update local id to match database id
              const updated = getStoredSubmissions().map((s) =>
                s.id === newRecord.id ? { ...s, id: result.submission.id } : s
              );
              saveStoredSubmissions(updated);
            }
          }
        })
        .catch((e) => console.debug('Submission API sync deferred:', e));
    }

    return newRecord;
  },

  approveSubmission(submissionId: string, moderatorName: string, notes?: string): {
    submission: CommunitySubmission;
    updatedEntity?: EntityProfile;
  } {
    const submissions = getStoredSubmissions();
    const subIndex = submissions.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) throw new Error('Submission not found');

    const sub = submissions[subIndex];
    const approvedSub: CommunitySubmission = {
      ...sub,
      status: 'approved',
      reviewedBy: moderatorName,
      reviewedAt: new Date().toISOString(),
      moderationNotes: notes || 'Verified against submitted source and approved for public profile.'
    };
    submissions[subIndex] = approvedSub;
    saveStoredSubmissions(submissions);

    // If attached to an entity, add evidence and create traceable revision
    let updatedEntity: EntityProfile | undefined;
    if (sub.entityId) {
      const entities = getStoredEntities();
      const entIndex = entities.findIndex((e) => e.id === sub.entityId);
      if (entIndex !== -1) {
        const ent = entities[entIndex];
        const newEvidenceId = `ev_${Date.now()}`;
        const newRevId = `rev_${Date.now()}`;

        // 1. Add Evidence Item
        const newEvidenceItem = {
          id: newEvidenceId,
          entityId: ent.id,
          title: sub.title,
          category: sub.evidenceCategory,
          description: sub.factualDescription,
          sourceUrl: sub.primarySourceUrl,
          submittedBy: `${sub.submittedBy.name} (${sub.submittedBy.role})`,
          submittedAt: sub.submittedAt,
          verifiedAt: new Date().toISOString(),
          verificationState: 'Community Corroborated' as const
        };

        // 2. Add Revision Record
        const newRevision = {
          id: newRevId,
          entityId: ent.id,
          versionNumber: ent.revisions.length + 1,
          authorName: sub.submittedBy.name,
          authorRole: 'Verified Contributor' as const,
          timestamp: new Date().toISOString(),
          summaryOfChange: `Approved evidence: ${sub.title}`,
          moderatedBy: moderatorName,
          diffSnippet: `+ Added [${sub.evidenceCategory}] evidence: ${sub.title} (Source: ${sub.primarySourceUrl})`
        };

        // 3. Add to Timeline
        const newTimelineEvent = {
          date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          title: `Evidence Verified: ${sub.title}`,
          description: sub.factualDescription,
          type: 'evidence' as const
        };

        updatedEntity = {
          ...ent,
          lastUpdated: new Date().toISOString(),
          evidence: [newEvidenceItem, ...ent.evidence],
          revisions: [newRevision, ...ent.revisions],
          timeline: [newTimelineEvent, ...ent.timeline]
        };

        entities[entIndex] = updatedEntity;
        saveStoredEntities(entities);
      }
    }

    // Call server API route for backend database persistence and audit recording
    if (typeof window !== 'undefined') {
      const activeUser = this.getActiveUser();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (activeUser.role === 'moderator') {
        headers['x-moderator-key'] = 'dev-verity-local-2026';
      }

      fetch(`/api/submissions/${encodeURIComponent(submissionId)}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ moderatorName, notes })
      }).catch((e) => console.debug('Async approval API sync deferred:', e));
    }

    return { submission: approvedSub, updatedEntity };
  },

  rejectSubmission(submissionId: string, moderatorName: string, notes?: string): CommunitySubmission {
    const submissions = getStoredSubmissions();
    const subIndex = submissions.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) throw new Error('Submission not found');

    const sub = submissions[subIndex];
    const rejectedSub: CommunitySubmission = {
      ...sub,
      status: 'rejected',
      reviewedBy: moderatorName,
      reviewedAt: new Date().toISOString(),
      moderationNotes: notes || 'Evidence rejected due to lack of verifiable official or secondary sources.'
    };
    submissions[subIndex] = rejectedSub;
    saveStoredSubmissions(submissions);

    // Call server API route for audit log persistence
    if (typeof window !== 'undefined') {
      const activeUser = this.getActiveUser();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (activeUser.role === 'moderator') {
        headers['x-moderator-key'] = 'dev-verity-local-2026';
      }

      fetch(`/api/submissions/${encodeURIComponent(submissionId)}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ moderatorName, notes })
      }).catch((e) => console.debug('Async rejection API sync deferred:', e));
    }

    return rejectedSub;
  },

  getActiveUser(): UserPersona {
    if (typeof window === 'undefined') return memoryActiveUser;
    try {
      const role = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER) as 'guest' | 'contributor' | 'moderator';
      return DEMO_PERSONAS[role] || DEMO_PERSONAS.contributor;
    } catch {
      return memoryActiveUser;
    }
  },

  setActiveUser(role: 'guest' | 'contributor' | 'moderator'): UserPersona {
    const persona = DEMO_PERSONAS[role] || DEMO_PERSONAS.contributor;
    memoryActiveUser = persona;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, role);
        window.dispatchEvent(new Event('verity_user_changed'));
      } catch (e) {
        console.error('Failed to set active user', e);
      }
    }
    return persona;
  },

  /**
   * Retrieves or computes aggregate community poll stats for a claim and version.
   * If userId is provided, returns user's active vote without exposing individual voter identities.
   */
  getClaimPoll(claimId: string, claimVersion: number = 1, userId?: string): ClaimPollData {
    const keyPrefix = `${claimId}__v${claimVersion}__`;
    const relevantVotes: ClaimVoteRecord[] = [];

    for (const [key, vote] of memoryVotes.entries()) {
      if (key.startsWith(keyPrefix)) {
        relevantVotes.push(vote);
      }
    }

    const totalVotes = relevantVotes.length;
    const counts: Record<CommunityVoteOption, number> = {
      true: 0,
      false: 0,
      partially_true: 0,
      insufficient_evidence: 0
    };

    let userVote: CommunityVoteOption | null = null;

    for (const v of relevantVotes) {
      if (counts[v.voteOption] !== undefined) {
        counts[v.voteOption]++;
      }
      if (userId && v.userId === userId) {
        userVote = v.voteOption;
      }
    }

    const calcPct = (count: number) => (totalVotes > 0 ? Math.round((count / totalVotes) * 1000) / 10 : 0);

    const pollRecord = memoryPolls.get(`${claimId}__v${claimVersion}`);

    return {
      pollId: pollRecord ? pollRecord.id : `poll_${claimId}_v${claimVersion}`,
      claimId,
      claimVersion,
      claimStatement: pollRecord ? pollRecord.statementText : 'Public factual claim under community review.',
      totalVotes,
      options: {
        true: { count: counts.true, percentage: calcPct(counts.true) },
        false: { count: counts.false, percentage: calcPct(counts.false) },
        partially_true: { count: counts.partially_true, percentage: calcPct(counts.partially_true) },
        insufficient_evidence: { count: counts.insufficient_evidence, percentage: calcPct(counts.insufficient_evidence) }
      },
      userVote,
      status: pollRecord?.status || 'active',
      policyNote:
        'Community voting reflects independent public sentiment. One vote per verified user per claim version. Crowd consensus does NOT override primary evidentiary proof.'
    };
  },

  /**
   * Casts or updates a user vote on a claim version.
   * Strictly enforces ONE vote per user per claim version (atomic upsert).
   */
  castClaimVote(params: {
    claimId: string;
    claimVersion?: number;
    userId: string;
    voteOption: CommunityVoteOption;
    rationale?: string;
    claimStatement?: string;
    claimTitle?: string;
  }): { poll: ClaimPollData; vote: ClaimVoteRecord } {
    const {
      claimId,
      claimVersion = 1,
      userId,
      voteOption,
      rationale,
      claimStatement = 'Public factual assertion',
      claimTitle = 'Claim Assessment Poll'
    } = params;

    const pollKey = `${claimId}__v${claimVersion}`;
    if (!memoryPolls.has(pollKey)) {
      memoryPolls.set(pollKey, {
        id: `poll_${claimId}_v${claimVersion}`,
        claimId,
        claimVersion,
        claimTitle,
        statementText: claimStatement,
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }

    const voteKey = `${claimId}__v${claimVersion}__${userId}`;
    const now = new Date().toISOString();

    const existingVote = memoryVotes.get(voteKey);
    const voteRecord: ClaimVoteRecord = {
      id: existingVote ? existingVote.id : `vote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pollId: memoryPolls.get(pollKey)!.id,
      claimId,
      claimVersion,
      userId,
      voteOption,
      rationale,
      createdAt: existingVote ? existingVote.createdAt : now,
      updatedAt: now
    };

    memoryVotes.set(voteKey, voteRecord);

    const updatedPoll = this.getClaimPoll(claimId, claimVersion, userId);
    return { poll: updatedPoll, vote: voteRecord };
  },

  /**
   * Allows an authenticated user to withdraw their vote from a claim poll.
   */
  withdrawClaimVote(params: {
    claimId: string;
    claimVersion?: number;
    userId: string;
  }): { poll: ClaimPollData; withdrawn: boolean } {
    const { claimId, claimVersion = 1, userId } = params;
    const voteKey = `${claimId}__v${claimVersion}__${userId}`;
    const existed = memoryVotes.delete(voteKey);
    const poll = this.getClaimPoll(claimId, claimVersion, userId);
    return { poll, withdrawn: existed };
  },

  /**
   * Retrieves all historical assessment revisions for a claim or canonical query.
   */
  getAssessmentRevisions(claimId: string): AssessmentRevision[] {
    return memoryAssessmentRevisions.get(claimId) || [];
  },

  /**
   * Records a new assessment revision, tracking score changes, source additions, and rationale.
   */
  recordAssessmentRevision(params: {
    claimId: string;
    newAssessmentLabel: AssessmentLabel;
    newScore: number | null;
    newIndependentOrigins: number;
    sourcesCount: number;
    triggerEvent?: AssessmentRevision['triggerEvent'];
    customRationale?: string;
  }): AssessmentRevision {
    const {
      claimId,
      newAssessmentLabel,
      newScore,
      newIndependentOrigins,
      sourcesCount,
      triggerEvent = 'initial_synthesis',
      customRationale
    } = params;

    const history = memoryAssessmentRevisions.get(claimId) || [];
    const prev = history.length > 0 ? history[history.length - 1] : null;

    const versionNumber = history.length + 1;
    const now = new Date().toISOString();

    let whatChangedRationale = customRationale || '';
    if (!whatChangedRationale) {
      if (!prev) {
        whatChangedRationale = `Initial evidentiary baseline established: verdict "${newAssessmentLabel}" with ${newScore !== null ? `${newScore}/100 support` : 'unscored (insufficient evidence)'} across ${newIndependentOrigins} independent publisher origins.`;
      } else {
        const scoreDiff = (newScore ?? 0) - (prev.newScore ?? 0);
        const originsDiff = newIndependentOrigins - prev.newIndependentOrigins;
        const labelChanged = prev.newAssessmentLabel !== newAssessmentLabel;

        const parts: string[] = [];
        if (labelChanged) {
          parts.push(`Verdict transitioned from "${prev.newAssessmentLabel}" to "${newAssessmentLabel}".`);
        }
        if (originsDiff > 0) {
          parts.push(`Added ${originsDiff} new independent publisher origin(s).`);
        }
        if (scoreDiff !== 0) {
          parts.push(`Evidence support score adjusted by ${scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} points (now ${newScore !== null ? `${newScore}/100` : 'null'}).`);
        }
        whatChangedRationale = parts.join(' ') || 'Evidence refreshed with latest live index telemetry; baseline metrics maintained.';
      }
    }

    const revision: AssessmentRevision = {
      revisionId: `rev_${claimId}_v${versionNumber}_${Date.now()}`,
      claimId,
      versionNumber,
      timestamp: now,
      previousAssessmentLabel: prev ? prev.newAssessmentLabel : null,
      newAssessmentLabel,
      previousScore: prev ? prev.newScore : null,
      newScore,
      previousIndependentOrigins: prev ? prev.newIndependentOrigins : 0,
      newIndependentOrigins,
      sourcesAddedCount: prev ? Math.max(0, sourcesCount - (prev.sourcesAddedCount || 0)) : sourcesCount,
      whatChangedRationale,
      triggerEvent: prev ? (triggerEvent === 'initial_synthesis' ? 'new_sources_discovered' : triggerEvent) : 'initial_synthesis'
    };

    history.push(revision);
    memoryAssessmentRevisions.set(claimId, history);

    return revision;
  },

  resetToDefaults() {
    saveStoredEntities(INITIAL_ENTITIES);
    saveStoredSubmissions(INITIAL_SUBMISSIONS);
    memoryVotes.clear();
    memoryPolls.clear();
    memoryAssessmentRevisions.clear();
  }
};
