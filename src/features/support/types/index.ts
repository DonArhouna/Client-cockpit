export type BugStatus = 'nouveau' | 'en_analyse' | 'en_cours' | 'en_test' | 'resolu' | 'ferme';
export type BugPriority = 'critique' | 'haute' | 'moyenne' | 'basse' | 'a_analyser';
export type BugImpact = 'production_bloquee' | 'cloture_impactee' | 'reporting_errone' | 'decision_faussee' | 'gene_operationnelle' | 'aucun_impact';
export type BugFrequency = 'toujours' | 'souvent' | 'parfois' | 'une_seule_fois' | 'intermittent';

export interface Bug {
  id: string;
  bugId: string;
  title: string;
  bug_type: string[];
  module: string;
  priority: BugPriority;
  status: BugStatus;
  
  // Environment
  url: string;
  browser: string;
  os: string;
  screen: string;
  
  // Business context
  entity_code: string;
  fiscal_year: number;
  
  // Details
  description: string;
  steps_to_reproduce: string[];
  expected_behavior?: string;
  actual_behavior?: string;
  frequency: BugFrequency;
  impact: BugImpact;
  
  // Attachments
  attachments: string[]; // URLs
  
  // Metadata
  submittedBy: {
    id: string;
    email: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBugDTO {
  title: string;
  description: string;
  module: string;
  priority: BugPriority;
  frequency: BugFrequency;
  impact: BugImpact;
  steps_to_reproduce: string[];
  expected_behavior?: string;
  actual_behavior?: string;
  attachments?: string[];
  
  // Auto-collected
  url: string;
  browser: string;
  os: string;
  screen: string;
}
