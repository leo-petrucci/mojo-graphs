export type MortgageData = {
  loan: number
  lenders: number
  likelyHood?: 'high' | 'moderate' | 'low'
  deposit?: boolean
  interestRate?: number
}

export const mortgageData: MortgageData[] = [
  {
    loan: 0,
    lenders: 75,
  },
  { loan: 20000, lenders: 75, deposit: true },
  {
    loan: 113456,
    lenders: 75,
    likelyHood: 'high',
    interestRate: 4.55,
  },
  {
    loan: 168000,
    lenders: 60,
    likelyHood: 'moderate',
    interestRate: 4.85,
  },
  {
    loan: 234567,
    lenders: 33,
    likelyHood: 'low',
    interestRate: 5.15,
  },
  {
    loan: 273000,
    lenders: 10,
  },
]
