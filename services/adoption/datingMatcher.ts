import { Pet } from '../../types';

export interface DatingMatch extends Pet {
  compatibilityScore: number;
  compatibilityReasons: string[];
}

const getWeightScore = (activePet: Pet, candidate: Pet) => {
  if (!activePet.weight || !candidate.weight) {
    return 15;
  }

  const heavier = Math.max(activePet.weight, candidate.weight);
  const lighter = Math.min(activePet.weight, candidate.weight);
  const ratio = lighter / heavier;

  if (ratio >= 0.8) return 30;
  if (ratio >= 0.65) return 18;
  if (ratio >= 0.5) return 8;
  return -20;
};

const getAgeScore = (activePet: Pet, candidate: Pet) => {
  const ageDiff = Math.abs(activePet.age - candidate.age);

  if (ageDiff <= 1) return 25;
  if (ageDiff <= 3) return 15;
  if (ageDiff <= 5) return 5;
  return -15;
};

const getBreedScore = (activePet: Pet, candidate: Pet) => {
  if (!activePet.breed || !candidate.breed) {
    return 0;
  }

  const activeBreed = activePet.breed.toLowerCase();
  const candidateBreed = candidate.breed.toLowerCase();

  if (activeBreed === candidateBreed) return 20;
  if (activeBreed.includes(candidateBreed) || candidateBreed.includes(activeBreed)) return 12;
  return 0;
};

const getReasons = (activePet: Pet, candidate: Pet) => {
  const reasons: string[] = [];
  const ageDiff = Math.abs(activePet.age - candidate.age);

  if (activePet.type === candidate.type) {
    reasons.push(`Mesmo porte de espécie: ${candidate.type}`);
  }

  if (ageDiff <= 3) {
    reasons.push('Faixa etária parecida');
  }

  if (activePet.weight && candidate.weight) {
    const diff = Math.abs(activePet.weight - candidate.weight);
    if (diff <= Math.max(3, activePet.weight * 0.25)) {
      reasons.push('Porte físico compatível');
    }
  }

  if (activePet.breed && candidate.breed && activePet.breed.toLowerCase() === candidate.breed.toLowerCase()) {
    reasons.push('Mesma raça');
  }

  return reasons.slice(0, 3);
};

export const findCompatibleDatingPets = (activePet: Pet, candidates: Pet[]): DatingMatch[] => {
  return candidates
    .filter((candidate) => candidate.availableForDating)
    .filter((candidate) => candidate.id !== activePet.id)
    .filter((candidate) => candidate.type === activePet.type)
    .map((candidate) => {
      const score =
        40 +
        getAgeScore(activePet, candidate) +
        getWeightScore(activePet, candidate) +
        getBreedScore(activePet, candidate);

      return {
        ...candidate,
        compatibilityScore: Math.max(0, Math.min(98, score)),
        compatibilityReasons: getReasons(activePet, candidate),
      };
    })
    .filter((candidate) => candidate.compatibilityScore >= 55)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};
