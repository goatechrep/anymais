

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
  | 'dashProfile' | 'dashLostFound' | 'dashMyOngs' | 'dashOverview'
  | 'logout' | 'welcome' | 'myPets' | 'vaccines'
  | 'serviceVet' | 'serviceGroom' | 'serviceHotel' | 'serviceWalker'
  | 'bookNow' | 'adoptMe' | 'match' | 'generateBio' | 'bioPlaceholder'
  | 'priceFree' | 'priceStart' | 'pricePremium' | 'popular'
  | 'featProfile' | 'featAdoption' | 'featBasic' | 'featVaccines'
  | 'featScheduling' | 'featStart' | 'featDating' | 'featAIBio' | 'featSupport'
  | 'featLostFound' | 'featOngRegister'
  | 'btnChooseBasic' | 'btnChooseStart' | 'btnChoosePremium'
  | 'signupTitle' | 'name' | 'confirmPassword' | 'signupButton' 
  | 'haveAccount' | 'noAccount' | 'createAccount'
  | 'editProfile' | 'saveChanges' | 'cancel' | 'weight' | 'photoUrl' 
  | 'ageLabel' | 'breedLabel' | 'changePhoto'
  | 'userProfile' | 'switchPet' | 'addNewPet' | 'noPets' | 'createFirstPet'
  | 'userSettings' | 'phone' | 'petName' | 'petType' | 'selectPet'
  | 'deletePet' | 'confirmDeletePet' | 'deletePetWarning' | 'confirm'
  | 'currentPlan' | 'upgradePlan' | 'planBenefits' | 'managePlan'
  | 'typeDog' | 'typeCat' | 'typeBird' | 'typeOther'
  | 'healthVaccine' | 'healthDate' | 'healthNextDue' | 'healthStatus'
  | 'healthNoRecords' | 'healthTip'
  | 'planDescBasic' | 'planDescStart' | 'planDescPremium'
  | 'availableForDatingLabel' | 'datingPlanWarning'
  | 'featureLocked' | 'upgradeToAccess' | 'unlockNow'
  | 'tooltipProfile' | 'tooltipAdoption' | 'tooltipDating' | 'tooltipHealth' | 'tooltipServices'
  | 'reqPlanBasic' | 'reqPlanStart' | 'reqPlanPremium'
  | 'landingAdoptionTitle' | 'landingAdoptionSubtitle' | 'landingAdoptionBtn'
  | 'publicAdoptionTitle' | 'publicAdoptionSubtitle' | 'backToHome' | 'interestBtn'
  | 'locationLabel' | 'getLocationBtn' | 'locationError' | 'kmAway' | 'locationUpdated'
  | 'selectedPlanLabel' | 'passwordStrength' | 'weak' | 'medium' | 'strong'
  | 'acceptTerms' | 'termsLink' | 'privacyLink' | 'termsError'
  | 'termsTitle' | 'privacyTitle' | 'emailError'
  | 'myFavorites' | 'noFavorites'
  | 'footerRights' | 'footerCompany' | 'footerLegal' | 'footerAbout' | 'footerContact' 
  | 'footerFollowUs' | 'footerBlog' | 'footerCareers' | 'footerHelp'
  | 'searchLocationPlaceholder' | 'searchBtn' | 'locationNotFound'
  | 'filterAll' | 'filterType' | 'minRating' | 'clearFilters'
  | 'detecting' | 'setLocation'
  | 'headerLanguage' | 'headerLocation' 
  | 'ongSectionTitle' | 'ongSectionSubtitle' | 'ongBtn' | 'ongFormTitle' | 'ongFormDesc' 
  | 'ongName' | 'ongCnpj' | 'ongDescription' | 'ongRegisterSuccess' | 'viewOngsBtn'
  | 'invalidCnpj' | 'invalidTaxId'
  | 'registeredOngsTitle' | 'seeAllOngs' | 'partnerOngs'
  | 'searchOngsPlaceholder' | 'noOngsFound'
  | 'viewOng' | 'aboutOng' | 'contactOng' | 'availablePets' | 'donateBtn' | 'copyPix' 
  | 'pixCopied' | 'bankDetails' | 'bankName' | 'agency' | 'account' | 'prevPage' | 'nextPage' | 'pageOf'
  | 'watchVideo' | 'pauseVideo' | 'verifyLocationBtn' | 'locationMatch' | 'locationMismatch' | 'verifying'
  | 'lostFoundTitle' | 'lostFoundSubtitle' | 'reportLost' | 'reportFound' | 'noLostPets' | 'myOngsTitle' | 'noMyOngs'
  | 'landingLostFoundTitle' | 'landingLostFoundSubtitle' | 'landingLostFoundBtn'
  | 'linkCopied'
  | 'overviewTitle' | 'statsTotalPets' | 'statsVaccinesDue' | 'statsAppointments' | 'statsMatches'
  | 'upcomingEvents' | 'noUpcomingEvents' | 'quickActions' | 'viewDetails'
  | 'vaccineCtaTitle' | 'vaccineCtaSubtitle' | 'vaccineCtaFeature1' | 'vaccineCtaFeature2' | 'vaccineCtaBtn'
  | 'datingCtaTitle' | 'datingCtaSubtitle' | 'datingCtaBtn'
  | 'servicesCtaTitle' | 'servicesCtaSubtitle' | 'servicesCtaBtn'
  | 'aboutTitle' | 'careersTitle' | 'blogTitle' | 'contactTitle' | 'helpTitle'
  | 'blogPartnerBtn' | 'whatsappBtn' | 'faqTitle'
  | 'tabFindServices' | 'tabMyAppointments' | 'bookServiceTitle' | 'selectDate' | 'selectTime' 
  | 'transportLabel' | 'transportOwner' | 'transportPickup' | 'confirmBooking' | 'bookingSuccess'
  | 'noAppointments' | 'appointmentWith' | 'at'
  | 'interestSuccess' | 'myInterestsTab' | 'findPetsTab' | 'noInterests' | 'statusLabel' | 'statusPending'
  | 'tabAbout' | 'tabTransparency' | 'transparencyTitle' | 'transparencyDesc'
  | 'financialIncome' | 'financialExpenses' | 'financialBalance'
  | 'expenseFood' | 'expenseVet' | 'expenseMaintenance' | 'expenseOther'
  | 'topDonors' | 'donorsCount' | 'lastUpdate';

export type PlanType = 'basic' | 'start' | 'premium';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  plan: PlanType;
  password?: string;
  location?: Coordinates;
  favorites?: string[];
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
  ongId?: string;
  vaccines?: Vaccine[];
  availableForDating?: boolean;
  location?: Coordinates;
}

export interface OngTransparency {
  month: string;
  year: number;
  income: number;
  expenses: {
    food: number;
    vet: number;
    maintenance: number;
    other: number;
  };
  donorsCount: number;
  topDonors: string[]; // Names or Initials
}

export interface Ong {
  id: string;
  ownerId?: string;
  name: string;
  image: string;
  description: string;
  location: string;
  coordinates?: Coordinates;
  email?: string;
  phone?: string;
  website?: string;
  pixKey?: string;
  bankInfo?: {
    bank: string;
    agency: string;
    account: string;
  };
  transparency?: OngTransparency;
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
  location?: Coordinates;
  address?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  petId: string;
  providerId: string;
  providerName: string; // Store name for easier display
  providerType: ServiceProvider['type'];
  date: string;
  time: string;
  transport: 'owner' | 'pickup';
  status: 'pending' | 'confirmed' | 'completed';
}

export interface AdoptionInterest {
  id: string;
  userId: string;
  petId: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type AppView = 'landing' | 'dashboard' | 'public-adoption' | 'terms' | 'privacy' | 'ong-register' | 'public-ongs' | 'ong-profile' | 'adoption-pet-profile' | 'about' | 'careers' | 'blog' | 'contact' | 'help';
export type DashboardView = 'overview' | 'profile' | 'adoption' | 'dating' | 'health' | 'services' | 'user-profile' | 'create-pet' | 'lost-found' | 'my-ongs';
