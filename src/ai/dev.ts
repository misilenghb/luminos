import { config } from 'dotenv';
config();

import '@/ai/flows/design-suggestions.ts';
import '@/ai/flows/inspiration-analysis.ts';
import '@/ai/flows/user-profile-flow.ts'; 
import '@/ai/flows/energy-image-analysis.ts'; 
import '@/ai/flows/image-generation-flow.ts';
import '@/ai/flows/translate-flow.ts';
import '@/ai/flows/refine-image-flow.ts';
import '@/ai/flows/accessory-suggestion-flow.ts';
import '@/ai/flows/daily-guidance-flow.ts';
import '@/ai/flows/creative-conversation-flow.ts';
import '@/ai/retry.ts';
    
// Note: We don't need to import the schema files here,
// as they are imported by the flows themselves.






