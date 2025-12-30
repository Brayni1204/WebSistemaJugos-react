/*
  Warnings:

  - You are about to drop the column `cantidad` on the `componente` table. All the data in the column will be lost.
  - You are about to drop the column `id_producto` on the `componente` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre_componente,tenantId]` on the table `Componente` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `componente` DROP FOREIGN KEY `Componente_id_producto_fkey`;

-- DropIndex
DROP INDEX `Componente_id_producto_fkey` ON `componente`;

-- AlterTable
ALTER TABLE `componente` DROP COLUMN `cantidad`,
    DROP COLUMN `id_producto`;

-- CreateTable
CREATE TABLE `_ComponenteToProducto` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ComponenteToProducto_AB_unique`(`A`, `B`),
    INDEX `_ComponenteToProducto_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Componente_nombre_componente_tenantId_key` ON `Componente`(`nombre_componente`, `tenantId`);

-- AddForeignKey
ALTER TABLE `_ComponenteToProducto` ADD CONSTRAINT `_ComponenteToProducto_A_fkey` FOREIGN KEY (`A`) REFERENCES `Componente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ComponenteToProducto` ADD CONSTRAINT `_ComponenteToProducto_B_fkey` FOREIGN KEY (`B`) REFERENCES `Producto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
