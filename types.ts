
export enum Language {
  PT = 'pt',
  EN = 'en',
  ES = 'es'
}

export type TranslationKey = 
  | 'heroTitle' | 'heroSubtitle' | 'ctaStart' | 'ctaLogin'
  | 'planBasic' | 'planStart' | 'planPremium' | 'perMonth'
  | 'features' | 'loginTitle' | 'email' | 'password' | 'loginButton'
  | 'dashHome' | 'dashAdoption' | 'dashDating' | 'dashHealth' | 'dashServices'
  | 'dashProfile' | 'logout' | 'welcome' | 'myPets' | 'vaccines'
  | 'serviceVet' | 'serviceGroom' | 'serviceHotel' | 'serviceWalker'
  | 'bookNow' | 'adoptMe' | 'match' | 'generateBio' | 'bioPlaceholder'
  | 'priceFree' | 'priceStart' | 'pricePremium' | 'popular'
  | 'featProfile' | 'featAdoption' | 'featBasic' | 'featVaccines'
  | 'featScheduling' | 'featStart' | 'featDating' | 'featAIBio' | 'featSupport'
  | 'btnChooseBasic' | 'btnChooseStart' | 'btnChoosePremium'
  | 'signupTitle' | 'name' | 'confirmPassword' | 'signupButton' 
  | 'haveAccount' | 'noAccount' | 'createAccount'
  | 'editProfile' | 'saveChanges' | 'cancel' | 'weight' | 'photoUrl' 
  | 'ageLabel' | 'breedLabel' | 'changePhoto'
  | 'userProfile' | 'switchPet' | 'addNewPet' | 'noPets' | 'createFirstPet'
  | 'userSettings' | 'phone' | 'petName' | 'petType' | 'selectPet'
  | 'deletePet' | 'confirmDeletePet' | 'deletePetWarning'
  | 'currentPlan' | 'upgradePlan' | 'planBenefits' | 'managePlan'
  | 'typeDog' | 'typeCat' | 'typeBird' | 'typeOther'
  | 'healthVaccine' | 'healthDate' | 'healthNextDue' | 'healthStatus'
  | 'healthNoRecords' | 'healthTip'
  | 'planDescBasic' | 'planDescStart' | 'planDescPremium'
  | 'availableForDatingLabel' | 'datingPlanWarning'
  | 'featureLocked' | 'upgradeToAccess' | 'unlockNow'
  | 'tooltipProfile' | 'tooltipAdoption' | 'tooltipDating' | 'tooltipHealth' | 'tooltipServices'
  | 'reqPlanBasic' | 'reqPlanStart' | 'reqPlanPremium';

export type PlanType = 'basic' | 'start' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  plan: PlanType;
  password?: string; // Added for simple auth simulation
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight?: number;
  type: 'dog' | 'cat' | 'bird' | 'other';
  image: string;
  bio: string;
  ownerId?: string;
  vaccines?: Vaccine[];
  availableForDating?: boolean;
}

export interface Vaccine {
  id: string;
  name: string;
  date: string;
  nextDueDate: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: 'veterinarian' | 'petshop' | 'dogwalker' | 'petsitter' | 'hotel';
  rating: number;
  image: string;
}

export type AppView = 'landing' | 'dashboard';
export type DashboardView = 'profile' | 'adoption' | 'dating' | 'health' | 'services' | 'user-profile' | 'create-pet';