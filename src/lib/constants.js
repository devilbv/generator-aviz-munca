export const DOCUMENT_TYPES = [
  { slug: 'cerere',             label: 'Cerere motivată' },
  { slug: 'fisa',               label: 'Fișa postului' },
  { slug: 'oferta',             label: 'Ofertă angajare' },
  { slug: 'proces',             label: 'Proces verbal' },
  { slug: 'opis_aviz',          label: 'Opis aviz' },
  { slug: 'contract_munca',     label: 'Contract de muncă' },
  { slug: 'contract_comodat',   label: 'Contract de comodat' },
  { slug: 'scrisoare_garantie', label: 'Scrisoare de garanție' },
  { slug: 'cv',                 label: 'CV' },
  { slug: 'offer_letter',       label: 'Offer Letter' },
  { slug: 'invitation_letter',  label: 'Invitation Letter' },
  { slug: 'delegatie_igi',      label: 'Delegație IGI' },
  { slug: 'organigrama',        label: 'Organigramă' },
]

export const DEFAULT_EMPLOYEE = {
  id: null,
  employeeName: '',
  passportNumber: '',
  passportCountryCode: '',
  birthDate: '',
  birthPlace: '',
  citizenship: '',
  passportIssueDate: '',
  passportExpiryDate: '',
  position: 'Curier',
  corCode: '9621',
  monthlySalary: '4050',
  workLocation: 'București',
  vacationDays: '21',
}

export const CSV_COLUMN_MAP = {
  'Nume Complet':     'employeeName',
  'Data Nașterii':    'birthDate',
  'Locul Nașterii':   'birthPlace',
  'Nationalitate':    'citizenship',
  'Nr. Pașaport':     'passportNumber',
  'Cod Țară':         'passportCountryCode',
  'Data Emiterii':    'passportIssueDate',
  'Data Expirării':   'passportExpiryDate',
  'Funcția':          'position',
  'Cod COR':          'corCode',
  'Salariu Brut':     'monthlySalary',
  'Loc Activitate':   'workLocation',
  'Zile Concediu':    'vacationDays',
}

export const CSV_TEMPLATE_ROWS = [
  { 'Nume Complet': 'Ion Popescu', 'Data Nașterii': '1990-01-15', 'Locul Nașterii': 'București', 'Nationalitate': 'Română', 'Nr. Pașaport': 'AB123456', 'Cod Țară': 'RO', 'Data Emiterii': '2020-01-01', 'Data Expirării': '2030-01-01', 'Funcția': 'Curier', 'Cod COR': '9621', 'Salariu Brut': '4050', 'Loc Activitate': 'București', 'Zile Concediu': '21' },
  { 'Nume Complet': 'Maria Ionescu', 'Data Nașterii': '1985-06-20', 'Locul Nașterii': 'Cluj', 'Nationalitate': 'Română', 'Nr. Pașaport': 'CD789012', 'Cod Țară': 'RO', 'Data Emiterii': '2019-06-01', 'Data Expirării': '2029-06-01', 'Funcția': 'Curier', 'Cod COR': '9621', 'Salariu Brut': '4050', 'Loc Activitate': 'Cluj', 'Zile Concediu': '21' },
  { 'Nume Complet': 'Ana Georgescu', 'Data Nașterii': '1995-03-10', 'Locul Nașterii': 'Timișoara', 'Nationalitate': 'Română', 'Nr. Pașaport': 'EF345678', 'Cod Țară': 'RO', 'Data Emiterii': '2021-03-01', 'Data Expirării': '2031-03-01', 'Funcția': 'Curier', 'Cod COR': '9621', 'Salariu Brut': '4050', 'Loc Activitate': 'Timișoara', 'Zile Concediu': '21' },
  { 'Nume Complet': 'Mihai Dumitrescu', 'Data Nașterii': '1988-09-25', 'Locul Nașterii': 'Iași', 'Nationalitate': 'Română', 'Nr. Pașaport': 'GH901234', 'Cod Țară': 'RO', 'Data Emiterii': '2018-09-01', 'Data Expirării': '2028-09-01', 'Funcția': 'Curier', 'Cod COR': '9621', 'Salariu Brut': '4050', 'Loc Activitate': 'Iași', 'Zile Concediu': '21' },
  { 'Nume Complet': 'Elena Constantin', 'Data Nașterii': '1992-12-05', 'Locul Nașterii': 'Brașov', 'Nationalitate': 'Română', 'Nr. Pașaport': 'IJ567890', 'Cod Țară': 'RO', 'Data Emiterii': '2022-12-01', 'Data Expirării': '2032-12-01', 'Funcția': 'Curier', 'Cod COR': '9621', 'Salariu Brut': '4050', 'Loc Activitate': 'Brașov', 'Zile Concediu': '21' },
]

export const WORK_PERMIT_STATUSES = {
  generated: { label: 'Generat', color: 'bg-green-100 text-green-800' },
  pending:   { label: 'În așteptare', color: 'bg-yellow-100 text-yellow-800' },
  error:     { label: 'Eroare', color: 'bg-red-100 text-red-800' },
  failed:    { label: 'Eșuat', color: 'bg-red-100 text-red-800' },
}
