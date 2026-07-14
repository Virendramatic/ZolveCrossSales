export interface LenderProfile {
    id: string;
    name: string;
    minLoanAmount?: number;
    maxLoanAmount?: number;
    minROI?: number;
    maxROI?: number;
    acceptedCountries?: string[];
    minCourseRanking?: number;
    processingFeePercentage?: number;
    active: boolean;
}
export interface MatchRecommendation {
    lenderId: string;
    lenderName: string;
    matchScore: number;
    factors: {
        loanAmountFit: number;
        courseFit: number;
        countryFit: number;
        roiFit: number;
        eligibilityScore: number;
    };
    recommendation: string;
    reasoning: string[];
}
export declare class MatcherService {
    /**
     * Calculate loan amount fit score (0-30)
     * Score improves as loan amount approaches lender's sweet spot
     */
    private static calculateLoanAmountFit;
    /**
     * Calculate course fit score (0-20)
     * Better scores for top-tier universities
     */
    private static calculateCourseFit;
    /**
     * Calculate country fit score (0-20)
     */
    private static calculateCountryFit;
    /**
     * Calculate ROI fit score (0-15)
     * Based on industry averages (assume 8% is ideal)
     */
    private static calculateROIFit;
    /**
     * Calculate eligibility score (0-15)
     * Based on lender's general viability and processing fees
     */
    private static calculateEligibilityScore;
    /**
     * Generate recommendations for a loan
     */
    static generateRecommendations(loanId: string, userId: string, userRole: string): Promise<MatchRecommendation[]>;
    /**
     * Get all active lenders in pool
     */
    static getLenderPool(): Promise<LenderProfile[]>;
}
//# sourceMappingURL=matcher.service.d.ts.map