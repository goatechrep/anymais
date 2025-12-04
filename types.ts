

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
  | 'dashProfile' | 'dashLostFound' | 'dashMyOngs'
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
  | 'deletePet' | 'confirmDeletePet' | 'deletePetWarning'
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
  | 'linkCopied' | 'adoptionSuccessTitle' | 'adoptionSuccessMsg'
  | 'viewMap' | 'viewList'
  | 'tabOverview' | 'tabTransparency' | 'totalRaised' | 'totalExpenses' | 'activeDonors'
  | 'monthlyBreakdown' | 'expenseFood' | 'expenseVet' | 'expenseMaintenance' | 'expenseMeds'
  | 'howToHelpTitle' | 'helpTip1' | 'helpTip2' | 'helpTip3'
  | 'locationMap' | 'invalidFileType' | 'fileTooLarge'
  | 'scheduleTitle' | 'selectDate' | 'selectTime' | 'confirmBooking' | 'bookingSuccess'
  | 'landingServicesTitle' | 'landingServicesSubtitle' | 'landingServicesBtn'
  | 'landingDatingTitle' | 'landingDatingSubtitle' | 'landingDatingBtn';

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

export interface OngFinancials {
  revenue: number;
  expenses: number;
  donors: number;
  breakdown: {
    food: number;
    vet: number;
    maintenance: number;
    meds: number;
  }
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
  financials?: OngFinancials;
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

export type AppView = 'landing' | 'dashboard' | 'public-adoption' | 'terms' | 'privacy' | 'ong-register' | 'public-ongs' | 'ong-profile' | 'adoption-pet-profile';
export type DashboardView = 'profile' | 'adoption' | 'dating' | 'health' | 'services' | 'user-profile' | 'create-pet' | 'lost-found' | 'my-ongs';