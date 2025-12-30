-- AlterTable
ALTER TABLE `tenant` ADD COLUMN `dark_mode_enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `theme_secondary_color` VARCHAR(191) NULL;
