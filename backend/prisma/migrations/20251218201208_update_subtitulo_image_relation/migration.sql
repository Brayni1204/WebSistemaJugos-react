/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `Subtitulo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `image` MODIFY `imageable_id` INTEGER NULL,
    MODIFY `imageable_type` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `subtitulo` ADD COLUMN `imageId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Subtitulo_imageId_key` ON `Subtitulo`(`imageId`);

-- AddForeignKey
ALTER TABLE `Subtitulo` ADD CONSTRAINT `Subtitulo_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
