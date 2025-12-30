-- AlterTable
ALTER TABLE `user` ADD COLUMN `verificationCode` VARCHAR(191) NULL,
    ADD COLUMN `verificationCodeExpiresAt` DATETIME(3) NULL;
