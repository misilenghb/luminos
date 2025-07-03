import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
import type { CrystalEnergyReadingOutput } from '@/ai/schemas/energy-image-analysis-schemas';

// The user wants to save the generated image and prompt, not the form state.
// So we redefine what a "Design" is in the gallery.
export interface DesignWithId {
    id: string;
    prompt: string;
    imageUrl: string;
    createdAt?: string;
}

export interface ProfileWithId extends UserProfileDataOutput {
    id:string;
    createdAt?: string;
}

export interface EnergyReadingWithId extends CrystalEnergyReadingOutput {
    id: string;
    createdAt?: string;
}
