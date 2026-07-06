-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COUNSELOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('NOT_CALLED', 'RESPONDING', 'NOT_RESPONDING', 'CONVERTED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('EDUCATION_LOAN', 'REMITTANCE', 'ACCOMMODATION', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "CollateralType" AS ENUM ('SECURED', 'NON_COLLATERAL');

-- CreateEnum
CREATE TYPE "ApplicantType" AS ENUM ('SALARIED', 'SELF_EMPLOYED');

-- CreateEnum
CREATE TYPE "LoanStage" AS ENUM ('STARTED', 'DOCS_PENDING', 'DOCS_RECEIVED', 'CALL_SCHEDULED', 'SANCTIONED', 'DISBURSED', 'LOST');

-- CreateEnum
CREATE TYPE "RecommendationSource" AS ENUM ('AUTO_RECOMMENDED', 'MANUAL');

-- CreateEnum
CREATE TYPE "LenderStatus" AS ENUM ('INTERESTED', 'APPLIED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('KYC', 'ACADEMICS', 'FINANCIALS', 'COLLATERAL');

-- CreateEnum
CREATE TYPE "DocumentRequestStatus" AS ENUM ('PENDING', 'PARTIAL_RECEIVED', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SubmissionMethod" AS ENUM ('UPLOAD', 'EMAIL', 'MANUAL_ENTRY');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('NOT_STARTED', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ARCHIVE', 'TRANSITION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'COUNSELOR',
    "passwordHash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deactivatedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "leadCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "country" TEXT,
    "intake" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "currentOwnerId" TEXT,
    "globalCallStatus" "CallStatus" NOT NULL DEFAULT 'NOT_CALLED',
    "rescheduleDate" TIMESTAMP(3),
    "leadSource" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInstance" (
    "id" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "status" TEXT,
    "stage" TEXT,
    "ownerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ProductInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "editedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationLoanApplication" (
    "id" TEXT NOT NULL,
    "loanCode" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "productInstanceId" TEXT,
    "university" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "targetCountry" TEXT,
    "totalLoanAmount" BIGINT NOT NULL,
    "expectedIntake" TEXT,
    "collateralType" "CollateralType" NOT NULL DEFAULT 'NON_COLLATERAL',
    "coApplicantName" TEXT,
    "coApplicantType" "ApplicantType",
    "loanStage" "LoanStage" NOT NULL DEFAULT 'STARTED',
    "stageUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "counselorZrmId" TEXT,
    "counselorLrmId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "EducationLoanApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LenderApplication" (
    "id" TEXT NOT NULL,
    "lenderCode" TEXT NOT NULL,
    "educationLoanId" TEXT NOT NULL,
    "lenderName" TEXT NOT NULL,
    "matchScore" INTEGER,
    "recommendationSource" "RecommendationSource" NOT NULL DEFAULT 'MANUAL',
    "lenderStatus" "LenderStatus" NOT NULL DEFAULT 'INTERESTED',
    "statusUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sanctionAmount" BIGINT,
    "roi" DECIMAL(5,2),
    "processingFee" BIGINT,
    "sanctionDate" TIMESTAMP(3),
    "sanctionValidity" TIMESTAMP(3),
    "disbursementAmount" BIGINT,
    "disbursementDate" TIMESTAMP(3),
    "tranchCount" INTEGER,
    "tranches" JSONB,
    "rejectionDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LenderApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LenderStatusHistory" (
    "id" TEXT NOT NULL,
    "lenderApplicationId" TEXT NOT NULL,
    "previousStatus" "LenderStatus",
    "newStatus" "LenderStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "LenderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanStageHistory" (
    "id" TEXT NOT NULL,
    "educationLoanId" TEXT NOT NULL,
    "previousStage" "LoanStage",
    "newStage" "LoanStage" NOT NULL,
    "transitionTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsibleCounselorId" TEXT,
    "reason" TEXT,

    CONSTRAINT "LoanStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRequest" (
    "id" TEXT NOT NULL,
    "docRequestCode" TEXT NOT NULL,
    "educationLoanId" TEXT NOT NULL,
    "categories" "DocumentCategory"[],
    "sentDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "status" "DocumentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSubmission" (
    "id" TEXT NOT NULL,
    "docSubmissionCode" TEXT NOT NULL,
    "documentRequestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "documentType" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "submissionMethod" "SubmissionMethod" NOT NULL DEFAULT 'UPLOAD',
    "submissionDate" TIMESTAMP(3),
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" BIGINT,
    "mimeType" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "versions" JSONB,
    "extractedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "auditCode" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "changes" JSONB,
    "sensitiveDataAccessed" BOOLEAN NOT NULL DEFAULT false,
    "accessReason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_leadCode_key" ON "Lead"("leadCode");

-- CreateIndex
CREATE INDEX "Lead_globalCallStatus_idx" ON "Lead"("globalCallStatus");

-- CreateIndex
CREATE INDEX "Lead_currentOwnerId_idx" ON "Lead"("currentOwnerId");

-- CreateIndex
CREATE INDEX "Lead_createdByUserId_idx" ON "Lead"("createdByUserId");

-- CreateIndex
CREATE INDEX "Lead_leadSource_idx" ON "Lead"("leadSource");

-- CreateIndex
CREATE INDEX "Lead_archivedAt_idx" ON "Lead"("archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductInstance_productCode_key" ON "ProductInstance"("productCode");

-- CreateIndex
CREATE INDEX "ProductInstance_leadId_idx" ON "ProductInstance"("leadId");

-- CreateIndex
CREATE INDEX "ProductInstance_productType_idx" ON "ProductInstance"("productType");

-- CreateIndex
CREATE INDEX "ProductInstance_ownerUserId_idx" ON "ProductInstance"("ownerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductInstance_leadId_productType_key" ON "ProductInstance"("leadId", "productType");

-- CreateIndex
CREATE INDEX "Comment_leadId_idx" ON "Comment"("leadId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EducationLoanApplication_loanCode_key" ON "EducationLoanApplication"("loanCode");

-- CreateIndex
CREATE UNIQUE INDEX "EducationLoanApplication_leadId_key" ON "EducationLoanApplication"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationLoanApplication_productInstanceId_key" ON "EducationLoanApplication"("productInstanceId");

-- CreateIndex
CREATE INDEX "EducationLoanApplication_leadId_idx" ON "EducationLoanApplication"("leadId");

-- CreateIndex
CREATE INDEX "EducationLoanApplication_loanStage_idx" ON "EducationLoanApplication"("loanStage");

-- CreateIndex
CREATE INDEX "EducationLoanApplication_counselorZrmId_idx" ON "EducationLoanApplication"("counselorZrmId");

-- CreateIndex
CREATE UNIQUE INDEX "LenderApplication_lenderCode_key" ON "LenderApplication"("lenderCode");

-- CreateIndex
CREATE INDEX "LenderApplication_educationLoanId_idx" ON "LenderApplication"("educationLoanId");

-- CreateIndex
CREATE INDEX "LenderApplication_lenderStatus_idx" ON "LenderApplication"("lenderStatus");

-- CreateIndex
CREATE INDEX "LenderStatusHistory_lenderApplicationId_idx" ON "LenderStatusHistory"("lenderApplicationId");

-- CreateIndex
CREATE INDEX "LoanStageHistory_educationLoanId_idx" ON "LoanStageHistory"("educationLoanId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentRequest_docRequestCode_key" ON "DocumentRequest"("docRequestCode");

-- CreateIndex
CREATE INDEX "DocumentRequest_educationLoanId_idx" ON "DocumentRequest"("educationLoanId");

-- CreateIndex
CREATE INDEX "DocumentRequest_status_idx" ON "DocumentRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSubmission_docSubmissionCode_key" ON "DocumentSubmission"("docSubmissionCode");

-- CreateIndex
CREATE INDEX "DocumentSubmission_documentRequestId_idx" ON "DocumentSubmission"("documentRequestId");

-- CreateIndex
CREATE INDEX "DocumentSubmission_category_idx" ON "DocumentSubmission"("category");

-- CreateIndex
CREATE INDEX "DocumentSubmission_status_idx" ON "DocumentSubmission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_auditCode_key" ON "AuditLog"("auditCode");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_currentOwnerId_fkey" FOREIGN KEY ("currentOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInstance" ADD CONSTRAINT "ProductInstance_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInstance" ADD CONSTRAINT "ProductInstance_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationLoanApplication" ADD CONSTRAINT "EducationLoanApplication_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationLoanApplication" ADD CONSTRAINT "EducationLoanApplication_productInstanceId_fkey" FOREIGN KEY ("productInstanceId") REFERENCES "ProductInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderApplication" ADD CONSTRAINT "LenderApplication_educationLoanId_fkey" FOREIGN KEY ("educationLoanId") REFERENCES "EducationLoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderStatusHistory" ADD CONSTRAINT "LenderStatusHistory_lenderApplicationId_fkey" FOREIGN KEY ("lenderApplicationId") REFERENCES "LenderApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanStageHistory" ADD CONSTRAINT "LoanStageHistory_educationLoanId_fkey" FOREIGN KEY ("educationLoanId") REFERENCES "EducationLoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequest" ADD CONSTRAINT "DocumentRequest_educationLoanId_fkey" FOREIGN KEY ("educationLoanId") REFERENCES "EducationLoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSubmission" ADD CONSTRAINT "DocumentSubmission_documentRequestId_fkey" FOREIGN KEY ("documentRequestId") REFERENCES "DocumentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
