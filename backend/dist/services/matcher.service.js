"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatcherService = void 0;
const index_1 = require("../index");
// Mock lender pool - in production, this would come from database
const LENDER_POOL = [
    {
        id: 'lender-1',
        name: 'Global Education Finance',
        minLoanAmount: 500000,
        maxLoanAmount: 5000000,
        minROI: 5,
        maxROI: 12,
        acceptedCountries: ['USA', 'UK', 'Canada', 'Australia'],
        minCourseRanking: 500,
        processingFeePercentage: 1.5,
        active: true,
    },
    {
        id: 'lender-2',
        name: 'Merit Education Loans',
        minLoanAmount: 300000,
        maxLoanAmount: 3000000,
        minROI: 6,
        maxROI: 14,
        acceptedCountries: ['USA', 'UK', 'Australia'],
        minCourseRanking: 300,
        processingFeePercentage: 2,
        active: true,
    },
    {
        id: 'lender-3',
        name: 'Aspirant Scholar Fund',
        minLoanAmount: 1000000,
        maxLoanAmount: 8000000,
        minROI: 4,
        maxROI: 10,
        acceptedCountries: ['USA', 'UK', 'Canada'],
        minCourseRanking: 100,
        processingFeePercentage: 1,
        active: true,
    },
    {
        id: 'lender-4',
        name: 'Regional Education Credit',
        minLoanAmount: 200000,
        maxLoanAmount: 2000000,
        minROI: 7,
        maxROI: 15,
        acceptedCountries: ['UK', 'Australia', 'Ireland'],
        minCourseRanking: 400,
        processingFeePercentage: 2.5,
        active: true,
    },
];
class MatcherService {
    /**
     * Calculate loan amount fit score (0-30)
     * Score improves as loan amount approaches lender's sweet spot
     */
    static calculateLoanAmountFit(loanAmount, lender) {
        const min = lender.minLoanAmount || 0;
        const max = lender.maxLoanAmount || Number.MAX_VALUE;
        // Outside range = 0
        if (loanAmount < min || loanAmount > max) {
            return 0;
        }
        // Inside range - calculate position
        const range = max - min;
        const midpoint = min + range / 2;
        const distance = Math.abs(loanAmount - midpoint);
        const maxDistance = range / 2;
        const score = 30 * (1 - distance / maxDistance);
        return Math.round(score);
    }
    /**
     * Calculate course fit score (0-20)
     * Better scores for top-tier universities
     */
    static calculateCourseFit(universityRanking, lender) {
        const ranking = universityRanking || 1000;
        const threshold = lender.minCourseRanking || 1000;
        if (ranking > threshold) {
            return 0; // Below lender's ranking threshold
        }
        // Score based on ranking - top 100 gets 20, progressively lower
        if (ranking <= 100)
            return 20;
        if (ranking <= 300)
            return 16;
        if (ranking <= 500)
            return 12;
        if (ranking <= 1000)
            return 8;
        return 4;
    }
    /**
     * Calculate country fit score (0-20)
     */
    static calculateCountryFit(country, lender) {
        if (!country || !lender.acceptedCountries)
            return 10; // Neutral score
        return lender.acceptedCountries.includes(country) ? 20 : 0;
    }
    /**
     * Calculate ROI fit score (0-15)
     * Based on industry averages (assume 8% is ideal)
     */
    static calculateROIFit(lender) {
        const minROI = lender.minROI || 5;
        const maxROI = lender.maxROI || 15;
        const idealROI = 8;
        // If ideal ROI is outside their range, lower score
        if (idealROI < minROI || idealROI > maxROI) {
            return 8;
        }
        // Ideal ROI is within their range - full score
        return 15;
    }
    /**
     * Calculate eligibility score (0-15)
     * Based on lender's general viability and processing fees
     */
    static calculateEligibilityScore(lender) {
        let score = 15;
        // Penalty for high processing fees
        const fee = lender.processingFeePercentage || 0;
        if (fee > 2.5)
            score -= 4;
        else if (fee > 2)
            score -= 2;
        return Math.max(0, score);
    }
    /**
     * Generate recommendations for a loan
     */
    static async generateRecommendations(loanId, userId, userRole) {
        // Verify loan exists and user has access
        const loan = await index_1.prisma.educationLoanApplication.findUnique({
            where: { id: loanId },
            include: { lead: true },
        });
        if (!loan) {
            const error = new Error('Loan not found');
            error.statusCode = 404;
            error.code = 'LOAN_NOT_FOUND';
            throw error;
        }
        // RBAC check
        if (userRole === 'COUNSELOR' && loan.lead.currentOwnerId !== userId) {
            const error = new Error('Access denied');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        // Get already matched lenders to exclude
        const alreadyMatched = await index_1.prisma.lenderApplication.findMany({
            where: { educationLoanId: loanId },
            select: { lenderName: true },
        });
        const matchedNames = new Set(alreadyMatched.map((l) => l.lenderName));
        // Convert loan amount to number for calculations (from bigint)
        const loanAmount = typeof loan.totalLoanAmount === 'bigint'
            ? Number(loan.totalLoanAmount)
            : loan.totalLoanAmount;
        // Generate recommendations
        const recommendations = LENDER_POOL.filter((l) => !matchedNames.has(l.name))
            .map((lender) => {
            const loanAmountFit = this.calculateLoanAmountFit(loanAmount, lender);
            const courseFit = this.calculateCourseFit(undefined, lender); // Would use real ranking in production
            const countryFit = this.calculateCountryFit(loan.targetCountry || undefined, lender);
            const roiFit = this.calculateROIFit(lender);
            const eligibilityScore = this.calculateEligibilityScore(lender);
            const matchScore = Math.min(100, loanAmountFit + courseFit + countryFit + roiFit + eligibilityScore);
            const reasoning = [];
            if (loanAmountFit >= 25) {
                reasoning.push(`Excellent loan amount fit (${loanAmountFit} points)`);
            }
            else if (loanAmountFit >= 15) {
                reasoning.push(`Good loan amount fit (${loanAmountFit} points)`);
            }
            else if (loanAmountFit === 0) {
                reasoning.push(`Loan amount outside lender range (₹${(lender.minLoanAmount || 0) / 100000}L - ₹${(lender.maxLoanAmount || 0) / 100000}L)`);
            }
            if (countryFit === 20) {
                reasoning.push(`${loan.targetCountry || 'Target country'} is in lender's accepted countries`);
            }
            else if (countryFit === 0 && loan.targetCountry) {
                reasoning.push(`${loan.targetCountry} is not in lender's accepted countries`);
            }
            if (eligibilityScore < 10) {
                reasoning.push(`High processing fee (${lender.processingFeePercentage}%)`);
            }
            reasoning.push(`ROI range: ${lender.minROI}% - ${lender.maxROI}%`);
            let recommendation = 'CONSIDER';
            if (matchScore >= 80)
                recommendation = 'HIGHLY_RECOMMENDED';
            else if (matchScore >= 60)
                recommendation = 'RECOMMENDED';
            else if (matchScore < 30)
                recommendation = 'NOT_RECOMMENDED';
            return {
                lenderId: lender.id,
                lenderName: lender.name,
                matchScore,
                factors: {
                    loanAmountFit,
                    courseFit,
                    countryFit,
                    roiFit,
                    eligibilityScore,
                },
                recommendation,
                reasoning,
            };
        })
            .sort((a, b) => b.matchScore - a.matchScore);
        return recommendations;
    }
    /**
     * Get all active lenders in pool
     */
    static async getLenderPool() {
        return LENDER_POOL.filter((l) => l.active);
    }
}
exports.MatcherService = MatcherService;
//# sourceMappingURL=matcher.service.js.map