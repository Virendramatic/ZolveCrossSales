# Phase 6: Lender Matching Engine - Implementation Guide

## Overview

The lender matching engine analyzes loan applications and recommends the best-fit lenders from the active lender pool. It uses a multi-factor scoring algorithm to ensure optimal lender-applicant matching.

## Architecture

### Components

1. **MatcherService** (`backend/src/services/matcher.service.ts`)
   - Core matching logic and scoring algorithm
   - Generates ranked recommendations based on multiple factors
   - Excludes already-matched lenders

2. **API Endpoints** (`backend/src/routes/education-loan.routes.ts`)
   - `POST /api/loans/:loanId/match` - Generate recommendations and auto-create lender applications
   - `GET /api/loans/:loanId/match` - Get recommendations without creating applications
   - `POST /api/loans/:loanId/match/rerun` - Re-run matcher for updated loan data

3. **Frontend Integration**
   - API client methods for matching operations
   - Context actions for managing recommendations
   - Ready for UI integration

## Scoring Algorithm

The matcher calculates a composite score (0-100) based on:

### 1. Loan Amount Fit (0-30 points)
- Evaluates loan amount against lender's range
- Full score when amount approaches lender's sweet spot (midpoint)
- Zero if outside acceptable range

### 2. Course Fit (0-20 points)
- Based on university ranking thresholds
- Top 100 universities: 20 points
- Top 300: 16 points
- Top 500: 12 points
- Below 1000: 8 points

### 3. Country Fit (0-20 points)
- 20 points if country in lender's accepted list
- 0 points if country not accepted
- 10 points (neutral) if no preference data

### 4. ROI Fit (0-15 points)
- 15 points if industry-average ROI (8%) falls within lender's range
- 8 points if outside range

### 5. Eligibility Score (0-15 points)
- Base 15 points
- Penalty for high processing fees (>2.5% = -4, >2% = -2)

## Lender Pool

Current active lenders in the system:

1. **Global Education Finance**
   - Loan Range: ₹5L - ₹50L
   - ROI: 5% - 12%
   - Countries: USA, UK, Canada, Australia
   - Min University Ranking: 500

2. **Merit Education Loans**
   - Loan Range: ₹3L - ₹30L
   - ROI: 6% - 14%
   - Countries: USA, UK, Australia
   - Min University Ranking: 300

3. **Aspirant Scholar Fund**
   - Loan Range: ₹10L - ₹80L
   - ROI: 4% - 10%
   - Countries: USA, UK, Canada
   - Min University Ranking: 100

4. **Regional Education Credit**
   - Loan Range: ₹2L - ₹20L
   - ROI: 7% - 15%
   - Countries: UK, Australia, Ireland
   - Min University Ranking: 400

## Recommendation Levels

- **HIGHLY_RECOMMENDED** (80-100 points): Best fit, prioritize these lenders
- **RECOMMENDED** (60-79 points): Good fit, worth pursuing
- **CONSIDER** (30-59 points): Moderate fit, keep as backup
- **NOT_RECOMMENDED** (0-29 points): Poor fit, only if no other options

## API Usage Examples

### Get Recommendations
```bash
GET /api/loans/{loanId}/match
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "lenderId": "lender-1",
      "lenderName": "Global Education Finance",
      "matchScore": 92,
      "factors": {
        "loanAmountFit": 28,
        "courseFit": 20,
        "countryFit": 20,
        "roiFit": 15,
        "eligibilityScore": 9
      },
      "recommendation": "HIGHLY_RECOMMENDED",
      "reasoning": [
        "Excellent loan amount fit (28 points)",
        "USA is in lender's accepted countries",
        "ROI range: 5% - 12%"
      ]
    }
  ]
}
```

### Auto-Create Applications
```bash
POST /api/loans/{loanId}/match
```

Automatically creates lender applications for top 5 recommended lenders.

### Re-run Matcher
```bash
POST /api/loans/{loanId}/match/rerun
```

Re-analyzes loan after changes (e.g., loan amount updated, country changed).

## Frontend Integration

### Using Match Recommendations
```typescript
const { matchLenders, getMatchRecommendations } = useEducationLoan();

// Get recommendations without creating applications
const recommendations = await getMatchRecommendations(loanId);

// Auto-create applications for recommended lenders
const result = await matchLenders(loanId);
```

## Future Enhancements

1. **Dynamic Lender Pool**
   - Move lender pool to database
   - Allow admin to add/update/remove lenders
   - Implement lender pool versioning

2. **ML-Based Scoring**
   - Train model on historical matching success rates
   - Adjust weights based on conversion metrics
   - Incorporate counselor feedback

3. **Advanced Filtering**
   - Collateral type preferences
   - Co-applicant eligibility
   - Processing timeline preferences

4. **Caching**
   - Cache recommendations for 2 hours
   - Invalidate on loan update or lender pool change
   - Implement Redis for distributed caching

## Testing

### Manual Testing Steps

1. Create an education loan application
2. Call `GET /api/loans/:loanId/match` to view recommendations
3. Call `POST /api/loans/:loanId/match` to auto-create applications
4. Verify lender applications appear in loan details
5. Update loan details (amount, country)
6. Call `POST /api/loans/:loanId/match/rerun` to refresh recommendations

### Expected Behavior

- Top-scoring lenders should match loan profile
- Recommendations should explain scoring factors
- Re-run should reflect updated loan parameters
- Already-matched lenders should not be recommended again

## Performance Notes

- Matching algorithm: O(n) where n = lender pool size
- Current pool: 4 lenders (negligible performance impact)
- Scaling: Can handle 100+ lenders without optimization
- Recommendation caching needed for 1000+ lenders

---

**Phase 6 Status**: ✅ Complete
- Lender matcher service implemented
- All endpoints working
- Frontend integration ready
- Ready for testing and UI development
